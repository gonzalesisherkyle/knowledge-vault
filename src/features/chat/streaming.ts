import type { Chunk } from "@/types";
import { API_BASE_URL, chatApi, getAuthHeaders, mapSource } from "@/lib/api";

export interface StreamHandlers {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onSource?: (source: Chunk) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export async function streamChat(
  message: string, 
  notebookId: string,
  sessionId?: string,
  handlers: StreamHandlers = {}
) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ 
        question: message,
        notebookId,
        sessionId
      }),
    });

    if (!response.ok || !response.body) {
      // Fallback to non-streaming if stream is unavailable
      const fallback = await chatApi.send(message, notebookId, sessionId);
      if (fallback.success && fallback.data) {
        fallback.data.sources?.forEach((source) => handlers.onSource?.(source));
        handlers.onToken?.(fallback.data.content);
        handlers.onEnd?.();
        return;
      }
      throw new Error(fallback.error?.message || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let ended = false;
    handlers.onStart?.();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const eventBlock of events) {
        const eventName = eventBlock
            .split('\n')
            .find((line) => line.startsWith('event: '))
            ?.replace('event: ', '')
            .trim();
        const dataStr = eventBlock
            .split('\n')
            .filter((line) => line.startsWith('data: '))
            .map((line) => line.replace('data: ', ''))
            .join('\n')
            .trim();

        if (!eventName || !dataStr) continue;

        let data;
        try {
          data = JSON.parse(dataStr);
        } catch (e) {
          continue;
        }

        switch (eventName) {
          case 'sources':
            (Array.isArray(data) ? data : [data]).forEach((source) => handlers.onSource?.(mapSource(source)));
            break;
          case 'token':
            handlers.onToken?.(typeof data === 'string' ? data : data.token);
            break;
          case 'done':
            ended = true;
            handlers.onEnd?.();
            break;
          case 'error':
            throw new Error(data.message || 'Streaming chat failed.');
        }
      }
    }

    if (!ended) handlers.onEnd?.();
  } catch (error) {
    handlers.onError?.(error);
  }
}
