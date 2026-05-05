import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import type { User, ApiResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.list();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = async (userData: { name: string; email: string; role: string }) => {
    try {
      const response = await usersApi.create(userData);
      if (response.success && response.data) {
        setUsers(prev => [response.data!, ...prev]);
        toast({
          title: 'User created',
          description: `${response.data.name} has been added successfully.`,
        });
        return response;
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to create user',
          variant: 'destructive',
        });
        return response;
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, error: { message: 'Unexpected error' } } as ApiResponse<User>;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await usersApi.delete(id);
      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast({
          title: 'User deleted',
          description: 'The user has been removed.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to delete user',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refresh: fetchUsers,
    createUser,
    deleteUser
  };
};
