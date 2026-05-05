import React from 'react';
import { Sparkles, ShieldCheck, Database, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthBranding: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-muted/30 relative flex-col p-10 justify-center border-r border-border/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.08),transparent)] pointer-events-none" />
      
      <div className="relative z-10 max-w-sm mx-auto">
        <Link to="/" className="flex items-center gap-2.5 mb-10 hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <span className="text-lg font-bold tracking-tight">KnowledgeVault</span>
        </Link>

        <div className="space-y-4 mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground">
            Your research, <br />
            <span className="text-primary">supercharged</span>.
          </h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            The unified intelligence workspace for teams that need to turn complex documents into actionable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card/50 border border-border/50 shadow-sm transition-all hover:bg-card hover:border-primary/20">
            <Database className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-bold text-[13px] mb-0.5">Unified Library</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Index PDFs and research papers in one searchable location.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card/50 border border-border/50 shadow-sm transition-all hover:bg-card hover:border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-bold text-[13px] mb-0.5">Source-Grounded Answers</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Verify every AI claim with direct citations to your original documents.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card/50 border border-border/50 shadow-sm transition-all hover:bg-card hover:border-primary/20">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-bold text-[13px] mb-0.5">Neural Retrieval</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Advanced semantic search across your entire library.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-10 p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Data Sovereignty</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
            "Your data stays yours. We provide the intelligence layer without compromising your privacy or security."
          </p>
        </div>
      </div>
    </div>
  );
};
