import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Clock, 
  ChevronRight, 
  Zap, 
  Target,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Notebook } from '@/types';

interface OverviewProps {
  notebook: Notebook | null;
  documentCount: number;
  sessionCount: number;
  onStartChat: () => void;
  onUploadClick: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ 
  notebook, 
  documentCount, 
  sessionCount,
  onStartChat,
  onUploadClick
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6 md:p-10 space-y-10">
      {/* Stat Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Indexed Knowledge', value: documentCount, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Sessions', value: sessionCount, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Research Velocity', value: 'High', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold font-mono">{stat.value}</p>
                  </div>
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Executive Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="xl:col-span-8 space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight">Intelligence Briefing</h2>
            </div>
            
            <Card className="border-border/40 bg-gradient-to-br from-card/60 to-background/40 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="h-32 w-32 rotate-12" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] uppercase tracking-widest font-bold px-2">Auto-Generated Summary</Badge>
                  <h3 className="text-2xl font-bold text-foreground/90 leading-tight">
                    {notebook?.title ? `Knowledge Overview: ${notebook.title}` : 'Initializing Research Environment...'}
                  </h3>
                </div>
                
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  {notebook?.description || "Your intelligent research environment is analyzing the connected knowledge base. Start by uploading documents to see a synthetic summary of your data."}
                </p>

                <div className="pt-4 flex flex-wrap gap-3">
                  <Badge className="bg-secondary/50 hover:bg-secondary/80 text-foreground border-border/50 px-3 py-1 text-[11px] font-bold">#Market Trends</Badge>
                  <Badge className="bg-secondary/50 hover:bg-secondary/80 text-foreground border-border/50 px-3 py-1 text-[11px] font-bold">#Technical Specs</Badge>
                  <Badge className="bg-secondary/50 hover:bg-secondary/80 text-foreground border-border/50 px-3 py-1 text-[11px] font-bold">#Risks</Badge>
                </div>

                <div className="pt-6 border-t border-border/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">U{i}</div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Collaborative Vault</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary font-bold text-xs uppercase tracking-widest group">
                    View Full Analysis <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="border-border/40 bg-card/30 hover:bg-card/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    <Zap className="h-4 w-4" />
                    <span>Immediate Action Items</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Cross-reference Q1 results with industry benchmarks.",
                      "Verify technical architecture claims in Document #4.",
                      "Identify missing gaps in the current research scope."
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 group cursor-pointer">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 group-hover:bg-primary transition-colors" />
                        <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
             </Card>
             <Card className="border-border/40 bg-card/30 hover:bg-card/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    <Target className="h-4 w-4" />
                    <span>Research Trajectory</span>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                        <span className="text-muted-foreground">Thematic Saturation</span>
                        <span className="text-foreground">85%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary/40 rounded-full overflow-hidden border border-border/20">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(20,184,166,0.3)]"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium italic">
                      "Your research is highly concentrated on market trends. Consider adding more technical implementation docs."
                    </p>
                  </div>
                </CardContent>
             </Card>
          </div>
        </motion.div>

        {/* Right Column: Quick Actions & History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="xl:col-span-4 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" /> Operations
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={onStartChat}
                className="w-full h-14 bg-primary text-primary-foreground font-bold text-[13px] uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all group"
              >
                <MessageSquare className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                Launch Research Chat
              </Button>
              <Button 
                variant="outline"
                onClick={onUploadClick}
                className="w-full h-14 border-border/50 bg-card/50 font-bold text-[13px] uppercase tracking-widest hover:bg-secondary/50 group"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:scale-125 transition-transform" />
                Add New Knowledge
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent Activity
            </h2>
            <Card className="border-border/40 bg-card/20 divide-y divide-border/20">
              {[
                { title: 'Source Uploaded', desc: 'MarketAnalysis_Q1.pdf', time: '2m ago' },
                { title: 'Insight Extracted', desc: 'Identified 4 risk factors', time: '1h ago' },
                { title: 'Chat Session', desc: 'Technical feasibility study', time: '3h ago' },
                { title: 'Notebook Updated', desc: 'New group member joined', time: '5h ago' },
              ].map((act, i) => (
                <div key={i} className="p-4 flex items-center justify-between group hover:bg-muted/10 transition-colors cursor-default">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground/80">{act.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{act.desc}</p>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">{act.time}</span>
                </div>
              ))}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
