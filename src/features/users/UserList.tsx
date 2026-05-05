import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User as UserIcon, 
  Trash2, 
  Mail, 
  Shield, 
  Calendar,
  MoreHorizontal,
  Loader2,
  Crown
} from 'lucide-react';
import type { GroupMember } from '@/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserListProps {
  members: GroupMember[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  currentUserRole: 'admin' | 'researcher';
  currentUserId?: string;
}

export const UserList: React.FC<UserListProps> = ({ 
  members, 
  isLoading, 
  onDelete, 
  currentUserRole,
  currentUserId 
}) => {
  if (isLoading && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Loading team...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-secondary/30 flex items-center justify-center mb-6">
          <UserIcon className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground/80">No members found</h3>
        <p className="text-muted-foreground text-sm max-w-[300px] mt-2 leading-relaxed font-medium">
          Invite your first researcher to start collaborating.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-10">Researcher</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Email</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Group Role</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Joined</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="group hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0 h-14">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20 shrink-0">
                    {(member.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-foreground flex items-center gap-2">
                      {member.name}
                      {member.userId === currentUserId && <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 border-primary/30 text-primary">You</Badge>}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="text-[12px] font-medium">{member.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {member.role === 'admin' ? (
                  <Badge variant="outline" className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-secondary/50 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                    <UserIcon className="h-3 w-3 mr-1 text-muted-foreground/70" />
                    Researcher
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[11px] font-medium">{format(new Date(member.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {currentUserRole === 'admin' && member.userId !== currentUserId ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border/50 shadow-xl">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 font-medium py-2" 
                        onClick={() => onDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="h-8 w-8" /> 
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
