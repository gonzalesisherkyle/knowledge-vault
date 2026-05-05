import React from 'react';
import type { Chunk } from '@/types';
import { BookOpen, FileText, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface SourcePanelProps {
  sources: Chunk[];
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sources }) => {
  const [expandedSourceId, setExpandedSourceId] = React.useState<string | null>(null);

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-8">
        <div className="h-16 w-16 rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-center mb-6 text-muted-foreground/30">
          <BookOpen className="h-8 w-8" />
        </div>
        <h4 className="text-sm font-bold text-foreground/80 mb-2">No active citations</h4>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-[250px]">
          Snippets and sources retrieved from your library will appear here during active research.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source, idx) => {
        const isExpanded = expandedSourceId === source.id;
        return (
        <div 
          key={source.id} 
          className="group flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 animate-in slide-in-from-right-4 relative overflow-hidden"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          {/* Subtle index number background */}
          <div className="absolute -top-4 -right-2 text-6xl font-black text-muted/20 select-none pointer-events-none">
            {idx + 1}
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-background border border-border/50 flex items-center justify-center shadow-sm shrink-0">
                <FileText className="h-4 w-4 text-primary/80" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-foreground truncate max-w-[180px]" title={source.metadata?.filename}>
                  {source.metadata?.filename || 'Document Source'}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                  Type: {source.metadata?.fileType || 'TXT'} {source.metadata?.page ? `• PAGE ${source.metadata.page}` : ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative mt-2 z-10">
            <div className="absolute -left-2 top-0 bottom-0 w-[3px] bg-primary/20 rounded-full" />
            <p className={`text-[12px] text-muted-foreground leading-relaxed pl-2 ${isExpanded ? '' : 'line-clamp-4'}`}>
              {source.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/40 z-10">
            {source.score ? (
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                 <Target className="h-3 w-3" />
                 Score: {(source.score * 100).toFixed(1)}%
               </div>
            ) : <div />}
            
            <button
              type="button"
              onClick={() => setExpandedSourceId(isExpanded ? null : source.id)}
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              {isExpanded ? (
                <>Collapse <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Read More <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
};
