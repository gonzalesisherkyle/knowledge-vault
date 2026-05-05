import { useState, useEffect, useCallback } from 'react';
import type { Document } from '@/types';
import { docsApi, errorMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useDocuments(notebookId: string | null) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (!notebookId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await docsApi.list(notebookId);
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setError(errorMessage(response.error, 'Failed to fetch documents'));
      }
    } catch (err) {
      setError('An error occurred while fetching documents');
    } finally {
      setIsLoading(false);
    }
  }, [notebookId]);

  const uploadDocument = async (file: File) => {
    if (!notebookId) return null;
    try {
      const response = await docsApi.upload(file, notebookId);
      if (response.success) {
        toast({
          title: 'Upload successful',
          description: `${file.name} has been uploaded and is being processed.`,
        });
        fetchDocuments();
        return response.data;
      } else {
        throw new Error(errorMessage(response.error, 'Upload failed'));
      }
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'An error occurred during upload.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await docsApi.delete(id);
      if (response.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast({
          title: 'Document deleted',
          description: 'The document has been successfully removed.',
        });
        return true;
      } else {
        throw new Error(errorMessage(response.error, 'Delete failed'));
      }
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'An error occurred during deletion.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    // Poll for status updates if any document is processing or queued
    const hasProcessing = documents.some(doc => ['queued', 'processing'].includes(doc.status));
    let interval: NodeJS.Timeout;
    
    if (hasProcessing) {
      interval = setInterval(fetchDocuments, 5000);
    }
    
    return () => clearInterval(interval);
  }, [fetchDocuments, documents]);

  return {
    documents,
    isLoading,
    error,
    refresh: fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
}
