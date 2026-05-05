import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Users, 
  Database, 
  ShieldCheck, 
  Plus,
  RefreshCcw,
  Activity
} from 'lucide-react';
import { UserList } from '@/features/users/UserList';
import { AddUserDialog } from '@/features/users/AddUserDialog';
import { useMembers } from '@/features/users/useMembers';
import { useAuth } from '@/features/auth/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

interface SystemConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId?: string;
}

export const SystemConfigDialog: React.FC<SystemConfigDialogProps> = ({ open, onOpenChange }) => {
  const { user, groupId, isAdmin } = useAuth();
  const { members, isLoading, refresh, addMember, removeMember } = useMembers(groupId);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden bg-card border-border/50 shadow-2xl flex flex-col">
          <DialogHeader className="p-6 border-b border-border/50 bg-background/50 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-sm">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">Group Configuration</DialogTitle>
                  <DialogDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                    {isAdmin 
                      ? "Manage team members, storage, and organization security." 
                      : "View research group members and system status."}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <Activity className="h-3 w-3" /> System Stable
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-background/30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 bg-background/50">
                <TabsList className="bg-secondary/50 border border-border/50 p-1 h-10">
                  <TabsTrigger value="users" className="gap-2 px-4 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary rounded-md">
                    <Users className="h-3.5 w-3.5" />
                    Researchers
                  </TabsTrigger>
                  <TabsTrigger value="engine" className="gap-2 px-4 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary rounded-md">
                    <Database className="h-3.5 w-3.5" />
                    Engine
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2 px-4 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary rounded-md">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Security
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="users" className="flex-1 overflow-auto m-0 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Workspace Researchers</h3>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">Found {members.length} authorized team members.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refresh}
                      disabled={isLoading}
                      className="h-9 px-3 border-border/50 bg-background/50 hover:bg-secondary/50 text-[11px] font-bold uppercase tracking-widest gap-2"
                    >
                      <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                      Refresh
                    </Button>
                    {isAdmin && (
                      <Button 
                        size="sm" 
                        onClick={() => setIsAddUserOpen(true)}
                        className="h-9 px-4 bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Researcher
                      </Button>
                    )}
                  </div>
                </div>

                <UserList 
                  members={members} 
                  isLoading={isLoading} 
                  onDelete={removeMember} 
                  currentUserRole={isAdmin ? 'admin' : 'researcher'}
                  currentUserId={user?.id}
                />
              </TabsContent>

              <TabsContent value="engine" className="flex-1 overflow-auto m-0 p-6">
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/30 border border-border/50">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground/80">Vector Store Parameters</h4>
                    <p className="text-[11px] text-muted-foreground font-medium max-w-[280px]">Advanced storage configuration is restricted to workspace administrators.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="flex-1 overflow-auto m-0 p-6">
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/30 border border-border/50">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground/80">Security Policies</h4>
                    <p className="text-[11px] text-muted-foreground font-medium max-w-[280px]">Endpoint encryption and audit logging are managed at the organization level.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <AddUserDialog 
          open={isAddUserOpen} 
          onOpenChange={setIsAddUserOpen} 
          onSubmit={addMember} 
        />
      )}
    </>
  );
};
