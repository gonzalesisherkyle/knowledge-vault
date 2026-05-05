import { useState, useEffect, useCallback } from 'react';
import { groupsApi } from '@/lib/api';
import type { GroupMember, ApiResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useMembers = (groupId: string | null) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    if (!groupId || groupId === 'null' || groupId === 'undefined') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await groupsApi.listMembers(groupId);
      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch members');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const addMember = async (memberData: { name: string; email: string; role: string; password?: string }) => {
    if (!groupId) return { success: false, error: { message: 'No active group' } } as ApiResponse<GroupMember>;
    try {
      const response = await groupsApi.addMember(groupId, memberData);
      if (response.success && response.data) {
        setMembers(prev => [...prev, response.data!]);
        toast({
          title: 'Researcher added',
          description: `${response.data.name} has been added to the group.`,
        });
        return response;
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to add member',
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
      return { success: false, error: { message: 'Unexpected error' } } as ApiResponse<GroupMember>;
    }
  };

  const removeMember = async (memberId: string) => {
    if (!groupId) return;
    try {
      const response = await groupsApi.removeMember(groupId, memberId);
      if (response.success) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        toast({
          title: 'Researcher removed',
          description: 'The member has been removed from the group.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to remove member',
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
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refresh: fetchMembers,
    addMember,
    removeMember
  };
};
