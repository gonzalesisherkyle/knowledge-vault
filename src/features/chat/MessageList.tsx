import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { User, Sparkles, Library } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onPromptSelect?: (prompt: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-12 pb-12">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={cn(
            "flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-500",
            message.role === 'user' ? "items-end" : "items-start"
          )}
        >
          <div className="flex items-center gap-2 px-2">
            {message.role === 'user' ? (
              <>
                <span className="text-[10px] text-muted-foreground/50 font-bold">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/80">
                  You
                </span>
                <User className="h-3.5 w-3.5 text-muted-foreground ml-1" />
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-primary mr-1" />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                  Research Assistant
                </span>
                <span className="text-[10px] text-muted-foreground/50 font-bold ml-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>

          <div className={cn(
            "max-w-[85%] text-sm leading-relaxed",
            message.role === 'user' 
              ? "bg-secondary/40 border border-border/50 px-5 py-3.5 rounded-2xl rounded-tr-sm text-foreground shadow-sm" 
              : "bg-transparent px-2"
          )}>
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap font-medium">{message.content}</p>
            ) : (
              <div className="markdown-content prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/30 prose-pre:border border-border/50 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 px-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mr-2">
                <Library className="h-3 w-3" /> Cited Sources
              </div>
              {message.sources.map((src, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-[10px] gap-1 px-2 py-0.5 bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                  title={src.metadata?.filename}
                >
                  [{idx + 1}] {src.metadata?.filename ? src.metadata.filename.substring(0, 15) : 'Source'}...
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {isTyping && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-500 items-start">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="h-3.5 w-3.5 text-primary mr-1 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
              Research Assistant
            </span>
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest ml-2">Reading Documents...</span>
          </div>
        </div>
      )}
    </div>
  );
};
