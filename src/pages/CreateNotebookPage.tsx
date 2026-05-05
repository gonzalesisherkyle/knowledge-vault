import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, BookOpen, Rocket } from 'lucide-react';
import { notebooksApi } from '@/lib/api';

export const CreateNotebookPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await notebooksApi.create({ title, description });
      if (response.success && response.data) {
        // Redirect to the newly created notebook
        navigate(`/notebook/${response.data.id}`);
      }
    } catch (error) {
      console.error('Failed to create notebook:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.05),transparent)] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10 border border-primary/20">
            <Rocket className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">Initialize Notebook</h1>
            <p className="text-muted-foreground text-xs font-medium">Define your research parameters to begin.</p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
          <form onSubmit={handleCreate}>
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1">
                <Sparkles className="h-2.5 w-2.5" />
                <span>New Research Vault</span>
              </div>
              <CardTitle className="text-lg font-bold">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Notebook Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Market Analysis 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 bg-secondary/20 border-border/40 focus:border-primary/50 text-sm font-medium rounded-lg transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Context (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Outline the scope of this research..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] bg-secondary/20 border-border/40 focus:border-primary/50 text-sm font-medium rounded-lg transition-all resize-none p-3"
                />
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-2 border-t border-border/20 bg-muted/10">
              <Button 
                type="submit" 
                className="w-full h-10 font-bold uppercase tracking-widest gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:scale-[1.01] transition-all text-xs"
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-3 w-3" />
                    Launch Notebook
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
