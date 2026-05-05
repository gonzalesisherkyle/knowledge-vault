import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooksApi } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';

export const LandingRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveWorkspace = async () => {
      try {
        const response = await notebooksApi.list();
        // The list API already maps the response to an array of notebooks
        const notebooks = response.data || [];

        if (notebooks.length > 0) {
          // Rule: Redirect to the most recently updated notebook (sorted by updatedAt desc by backend)
          navigate(`/notebook/${notebooks[0].id}`, { replace: true });
        } else {
          // Rule: If no notebook exists, take user to the creation onboarding
          navigate('/create-notebook', { replace: true });
        }
      } catch (error) {
        console.error('Failed to resolve workspace:', error);
        setIsLoading(false);
      }
    };

    resolveWorkspace();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <Loader2 className="absolute -inset-2 h-16 w-16 text-primary/20 animate-spin" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Synchronizing Research Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Workspace Resolution Failed</h2>
      <p className="text-muted-foreground mb-6">We couldn't initialize your research environment.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm uppercase tracking-widest"
      >
        Retry Synchronization
      </button>
    </div>
  );
};
