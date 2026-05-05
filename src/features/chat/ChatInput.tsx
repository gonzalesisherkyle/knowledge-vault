import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, CornerDownLeft, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative max-w-4xl mx-auto w-full">
      <div className={cn(
        "relative bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/10 transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 focus-within:ring-offset-background",
        disabled && "opacity-60 grayscale-[0.2] pointer-events-none"
      )}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or request a summary..."
          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none focus-visible:outline-none resize-none py-3 px-4 text-sm font-medium leading-relaxed placeholder:text-muted-foreground/60 text-foreground"
          disabled={disabled}
        />
        
        <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
              <Database className="h-2.5 w-2.5 text-primary/80" />
              <span>Notebook Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/50 border border-border/40 text-[9px] font-bold text-muted-foreground/60 uppercase">
              <span>Return</span>
              <CornerDownLeft className="h-2.5 w-2.5 ml-0.5" />
            </div>
            <Button 
              size="sm" 
              onClick={() => handleSubmit()}
              disabled={!input.trim() || disabled}
              className={cn(
                "h-8 px-3 rounded-lg gap-2 text-[11px] font-bold transition-all duration-300",
                input.trim() && !disabled 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:scale-[1.02]" 
                  : "bg-secondary text-muted-foreground/50"
              )}
            >
              {disabled ? 'Synthesizing' : 'Send'}
              <SendHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
