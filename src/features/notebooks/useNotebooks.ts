import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Notebook } from '@/types';
import { notebooksApi, errorMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useNotebooks() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const activeNotebookId = id || null;
  const activeNotebook = notebooks.find(nb => nb.id === activeNotebookId) || null;

  const fetchNotebooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notebooksApi.list();
      if (response.success && response.data) {
        const fetchedNotebooks = response.data;
        setNotebooks(fetchedNotebooks);
        
        // If we are on the root or an invalid notebook path, resolve to the latest
        if (!id && fetchedNotebooks.length > 0) {
          navigate(`/notebook/${fetchedNotebooks[0].id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Failed to fetch notebooks', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  const selectNotebook = (newId: string) => {
    if (newId !== id) {
      navigate(`/notebook/${newId}`);
    }
  };

  const createNotebook = async (title: string, description?: string) => {
    try {
      const response = await notebooksApi.create({ title, description });
      if (response.success && response.data) {
        const newNotebook = response.data;
        setNotebooks(prev => [newNotebook, ...prev]);
        navigate(`/notebook/${newNotebook.id}`);
        toast({
          title: 'Notebook created',
          description: `"${title}" is now active.`,
        });
        return newNotebook;
      } else {
        throw new Error(errorMessage(response.error, 'Failed to create notebook'));
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteNotebook = async (targetId: string) => {
    try {
      const response = await notebooksApi.delete(targetId);
      if (response.success) {
        setNotebooks(prev => prev.filter(nb => nb.id !== targetId));
        if (id === targetId) {
          navigate('/', { replace: true });
        }
        toast({
          title: 'Notebook deleted',
        });
        return true;
      }
    } catch (err) {
      toast({
        title: 'Delete failed',
        variant: 'destructive',
      });
    }
    return false;
  };

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  return {
    notebooks,
    activeNotebook,
    activeNotebookId,
    isLoading,
    selectNotebook,
    createNotebook,
    deleteNotebook,
    refresh: fetchNotebooks,
  };
}
