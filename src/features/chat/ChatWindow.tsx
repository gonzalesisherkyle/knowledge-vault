import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SourcePanel } from './SourcePanel';
import { Database, Sparkles, PanelRight, Quote, Info, MessageSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { ChatMessage, Chunk } from '@/types';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoadingHistory: boolean;
  currentSources: Chunk[];
  onSendMessage: (message: string) => Promise<void>;
  notebookId: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages,
  isTyping,
  isLoadingHistory,
  currentSources,
  onSendMessage,
  notebookId
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSources, setShowSources] = React.useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping, isLoadingHistory]);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex-1 flex flex-col min-w-0 border-r border-border/40 relative bg-background/50">
        <div className="absolute top-4 left-4 md:left-8 z-20 flex items-center gap-3">
          <div className="bg-card/80 backdrop-blur-md border border-border/50 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-black/10 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Research Engine <span className="text-muted-foreground/40 font-black ml-1">v2.1</span>
          </div>
          {isTyping && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Synthesizing...
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 md:right-8 z-20 flex items-center gap-2">
          {/* Desktop Toggle */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSources(!showSources)}
            className="hidden lg:flex border-border/50 bg-card/80 backdrop-blur-md text-muted-foreground hover:text-foreground h-9 gap-2 text-xs font-bold uppercase tracking-widest px-4 shadow-xl shadow-black/10"
          >
            <PanelRight className={cn("h-4 w-4 transition-transform", showSources && "rotate-180")} />
            {showSources ? 'Focus Chat' : 'Show Sources'}
          </Button>

          {/* Mobile Source Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="lg:hidden border-border/50 bg-card/80 backdrop-blur-md text-muted-foreground hover:text-foreground h-9 gap-2 text-xs font-bold uppercase tracking-widest px-4 shadow-xl shadow-black/10"
              >
                <Database className="h-4 w-4" />
                Context
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full sm:w-[440px] border-l border-border/50 bg-card">
              <div className="p-6 h-16 border-b border-border/50 flex items-center justify-between bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Retrieved Context</h3>
                    <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Found {currentSources.length} relevant excerpts</p>
                  </div>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-64px)]">
                <div className="p-6">
                  <SourcePanel sources={currentSources} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8 pt-20 pb-8">
          <div className="max-w-3xl mx-auto py-10">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Loading Workspace...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-secondary/20 flex items-center justify-center border border-border/50 text-muted-foreground/30">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground/80">Focused Research Space</h3>
                  <p className="text-sm text-muted-foreground max-w-sm font-medium">
                    Ask a question about your documents to start synthesizing new insights.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full pt-4">
                  {[
                    "Summarize key findings...",
                    "What are the main risks mentioned?",
                    "Extract all technical specs...",
                    "Analyze the project timeline..."
                  ].map(prompt => (
                    <Button 
                      key={prompt}
                      variant="outline" 
                      className="h-auto py-3 px-4 text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 bg-card/30 border-border/30 justify-start transition-all"
                      onClick={() => onSendMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <MessageList messages={messages} isTyping={isTyping} onPromptSelect={onSendMessage} />
            )}
          </div>
        </ScrollArea>
        
        <div className="px-4 md:px-8 py-3 md:py-4 border-t border-border/40 bg-card/50 backdrop-blur-2xl">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <ChatInput onSend={onSendMessage} disabled={isTyping || !notebookId} />
            {!notebookId ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                <Info className="h-3.5 w-3.5" />
                Select a research notebook to begin analysis
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Secure E2E</span>
                  <span className="flex items-center gap-1.5"><Quote className="h-3 w-3" /> Grounded in Source</span>
                </div>
                <span>Markdown Supported</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSources && (
        <div className="w-[440px] hidden lg:flex flex-col bg-card border-l border-border/40 shrink-0 animate-in slide-in-from-right-10 duration-500 shadow-2xl shadow-black/20">
          <div className="p-6 h-16 border-b border-border/50 flex items-center justify-between bg-background/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/90">Source Retrieval</h3>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-0.5">Verified Contextual Fragments</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50 text-[10px] font-black font-mono text-muted-foreground uppercase">
              {currentSources.length} UNITS
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              <SourcePanel sources={currentSources} />
            </div>
          </ScrollArea>
          <div className="p-6 border-t border-border/50 bg-background/30">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> AI Verification
              </p>
              <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                All highlights are extracted from your uploaded documents to ensure factual consistency and minimize hallucinations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
