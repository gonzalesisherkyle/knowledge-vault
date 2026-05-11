import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, 
  Mail, 
  User as UserIcon, 
  Shield, 
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userData: { name: string; email: string; role: string; password?: string }) => Promise<any>;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('researcher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError('Name, email, and an initial password of at least 8 characters are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await onSubmit({ name, email, role, password });
      if (result.success) {
        onOpenChange(false);
        setName('');
        setEmail('');
        setPassword('');
        setRole('researcher');
      } else {
        setError(result.error?.message || 'Failed to create user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Add Researcher</DialogTitle>
          </div>
          <DialogDescription className="text-sm font-medium text-muted-foreground ml-11">
            Grant workspace access to a new team member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 p-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="pl-11 h-11 bg-secondary/20 border-border/50 focus:ring-primary/20 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.smith@example.com"
                  className="pl-11 h-11 bg-secondary/20 border-border/50 focus:ring-primary/20 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Initial Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-11 h-11 bg-secondary/20 border-border/50 focus:ring-primary/20 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Group Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 bg-secondary/20 border-border/50 focus:ring-primary/20 font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground/50" />
                    <SelectValue placeholder="Select role" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  <SelectItem value="researcher" className="font-medium">Researcher</SelectItem>
                  <SelectItem value="admin" className="font-medium text-primary">Group Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-border/50 bg-background/50 gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="font-semibold text-xs uppercase tracking-widest"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim() || !email.trim() || password.length < 8} 
              className="px-6 font-bold text-xs uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Add User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
