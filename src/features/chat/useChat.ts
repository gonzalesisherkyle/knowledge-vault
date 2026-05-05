import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, Chunk, ChatSession } from '@/types';
import { streamChat } from './streaming';
import { useToast } from '@/hooks/use-toast';
import { chatApi } from '@/lib/api';

export function useChat(notebookId: string | null) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTemporary, setIsTemporary] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentSources, setCurrentSources] = useState<Chunk[]>([]);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    if (!notebookId) {
      setSessions([]);
      return;
    }
    const response = await chatApi.listSessions(notebookId);
    if (response.success && response.data) {
      setSessions(response.data);
    }
  }, [notebookId]);

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoadingHistory(true);
    setActiveSessionId(sessionId);
    setMessages([]);
    setCurrentSources([]);
    
    try {
      const response = await chatApi.getSessionMessages(sessionId);
      if (response.success && response.data) {
        setMessages(response.data.messages);
        // Extract sources from all messages for the current sources view if desired
        // though typically sources are per-message in the list
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load chat history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  const createNewSession = useCallback(async (title?: string) => {
    if (!notebookId) return null;
    const response = await chatApi.createSession(notebookId, title);
    if (response.success && response.data) {
      setSessions(prev => [response.data!, ...prev]);
      setActiveSessionId(response.data.id);
      setMessages([]);
      setCurrentSources([]);
      return response.data;
    }
    return null;
  }, [notebookId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !notebookId) return;

    let currentSessionId = activeSessionId;
    const isNowTemporary = isTemporary;

    // Auto-create session if none active and NOT in temporary mode
    if (!currentSessionId && !isNowTemporary) {
      const newSession = await createNewSession();
      if (!newSession) return;
      currentSessionId = newSession.id;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setCurrentSources([]);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantContent = '';

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      },
    ]);

    await streamChat(content, notebookId, currentSessionId, {
      onStart: () => {
        setIsTyping(true);
      },
      onToken: (token) => {
        assistantContent += token;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      },
      onSource: (source) => {
        setCurrentSources((prev) => {
          if (prev.some(s => s.id === source.id)) return prev;
          return [...prev, source];
        });
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, sources: [...(msg.sources || []), source] }
              : msg
          )
        );
      },
      onEnd: () => {
        setIsTyping(false);
        fetchSessions(); // Refresh sessions to get updated titles/timestamps
      },
      onError: (_err) => {
        setIsTyping(false);
        toast({
          title: 'Chat Error',
          description: 'Failed to get response from assistant.',
          variant: 'destructive',
        });
      },
    });
  }, [notebookId, activeSessionId, createNewSession, fetchSessions, toast]);

  const clearChat = useCallback((temporary: boolean = false) => {
    setActiveSessionId(null);
    setIsTemporary(temporary);
    setMessages([]);
    setCurrentSources([]);
    setIsTyping(false);
  }, []);

  const deleteSession = async (id: string) => {
    const response = await chatApi.deleteSession(id);
    if (response.success) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) clearChat();
      return true;
    }
    return false;
  };

  const renameSession = async (id: string, title: string) => {
    const response = await chatApi.updateSession(id, { title });
    if (response.success && response.data) {
      setSessions(prev => prev.map(s => s.id === id ? response.data! : s));
      return true;
    }
    return false;
  };

  const togglePinSession = async (id: string, isPinned: boolean) => {
    const response = await chatApi.updateSession(id, { isPinned });
    if (response.success && response.data) {
      // Re-fetch or re-sort sessions
      setSessions(prev => {
        const next = prev.map(s => s.id === id ? response.data! : s);
        return [...next].sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchSessions();
    clearChat();
  }, [notebookId, fetchSessions, clearChat]);

  return {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    isTemporary,
    isLoadingHistory,
    currentSources,
    sendMessage,
    loadSession,
    createNewSession,
    clearChat,
    deleteSession,
    renameSession,
    togglePinSession,
    refreshSessions: fetchSessions,
  };
}
