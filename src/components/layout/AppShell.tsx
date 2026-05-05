import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { 
  Command, 
  User, 
  Menu, 
  PlusCircle, 
  FileText,
  Book,
  ChevronDown,
  Check,
  SearchIcon,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Notebook, ChatSession } from '@/types';
import { SystemConfigDialog } from './SystemConfigDialog';
import { useAuth } from '@/features/auth/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';

interface AppShellProps {
  children: React.ReactNode;
  activeSection?: 'overview' | 'chat' | 'documents';
  onSectionChange?: (section: 'overview' | 'chat' | 'documents') => void;
  onNewResearch?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  onNotebookSelect: (id: string) => void;
  onNotebookCreate: (title: string, description?: string) => Promise<any>;
  sessions: ChatSession[];
  activeSessionId: string | null;
  isTemporary?: boolean;
  onSessionSelect: (id: string) => void;
  onSessionDelete: (id: string) => void;
  onSessionRename: (id: string, title: string) => void;
  onSessionPin: (id: string, isPinned: boolean) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeSection = 'overview',
  onSectionChange,
  onNewResearch,
  searchValue = '',
  onSearchChange,
  notebooks,
  activeNotebook,
  onNotebookSelect,
  onNotebookCreate,
  sessions,
  activeSessionId,
  isTemporary = false,
  onSessionSelect,
  onSessionDelete,
  onSessionRename,
  onSessionPin
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleMobileNav = (section: 'overview' | 'chat' | 'documents') => {
    onSectionChange?.(section);
    setIsMobileMenuOpen(false);
  };

  const handleMobileSessionSelect = (id: string) => {
    onSessionSelect(id);
    onSectionChange?.('chat');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 selection:text-foreground">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={onSectionChange} 
        onNewResearch={onNewResearch} 
        notebooks={notebooks}
        activeNotebook={activeNotebook}
        onNotebookSelect={onNotebookSelect}
        onNotebookCreate={onNotebookCreate}
        sessions={sessions}
        activeSessionId={activeSessionId}
        isTemporary={isTemporary}
        onSessionSelect={onSessionSelect}
        onSessionDelete={onSessionDelete}
        onSessionRename={onSessionRename}
        onSessionPin={onSessionPin}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r border-border/50 flex flex-col bg-card">
                <SheetHeader className="p-4 border-b border-border/50 text-left bg-background/50">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between px-2 hover:bg-muted/50 h-10 border border-border/20">
                        <div className="flex items-center gap-2 truncate text-foreground">
                          <Book className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm truncate">{activeNotebook?.title || 'Select Notebook'}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 bg-popover border-border/50 shadow-xl">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-2 py-1.5">Your Workspaces</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/30" />
                      {notebooks.map(nb => (
                        <DropdownMenuItem 
                          key={nb.id} 
                          onClick={() => { onNotebookSelect(nb.id); setIsMobileMenuOpen(false); }}
                          className="flex items-center justify-between cursor-pointer py-2 px-3 focus:bg-primary/10"
                        >
                          <span className="truncate font-medium">{nb.title}</span>
                          {activeNotebook?.id === nb.id && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SheetHeader>
                <div className="py-6 flex-none">
                  <div className="px-4 mb-6">
                    <Button
                      variant="default"
                      className="w-full justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold h-10 shadow-sm shadow-primary/20"
                      onClick={() => {
                        onNewResearch?.();
                        handleMobileNav('chat');
                      }}
                    >
                      <PlusCircle className="h-4 w-4" />
                      New Research
                    </Button>
                  </div>
                  <nav className="px-3 space-y-1">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-3 px-3 h-10 text-[13px] font-semibold transition-all",
                        activeSection === 'overview' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => handleMobileNav('overview')}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-3 px-3 h-10 text-[13px] font-semibold transition-all",
                        activeSection === 'documents' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => handleMobileNav('documents')}
                    >
                      <FileText className="h-4 w-4" />
                      Library
                    </Button>
                  </nav>
                </div>
                
                {sessions.length > 0 && (
                  <div className="flex-1 flex flex-col min-h-0 px-3 pb-6 border-t border-border/30 pt-4">
                    <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                      Recent Sessions
                    </div>
                    <ScrollArea className="flex-1 -mx-3 px-3">
                      <div className="space-y-0.5">
                        {sessions.map(session => (
                          <button
                            key={session.id}
                            onClick={() => handleMobileSessionSelect(session.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-[12px] transition-all text-left truncate group",
                              activeSessionId === session.id 
                                ? "bg-primary/5 text-primary font-bold border border-primary/10" 
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
                            )}
                          >
                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", activeSessionId === session.id ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50")} />
                            <span className="truncate">{session.title}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-foreground/90">
              <span className="hidden md:inline text-muted-foreground/60 font-medium">Workspace</span>
              <span className="hidden md:inline text-muted-foreground/20">/</span>
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{activeNotebook?.title || 'Notebook'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex items-center group max-w-[200px] sm:max-w-xs md:max-w-md">
              <SearchIcon className="absolute left-3 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="search"
                placeholder="Search research..."
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
                className="pl-9 h-9 w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-1 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-secondary/50 placeholder:text-muted-foreground/50 font-medium"
              />
              <div className="absolute right-2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/50 bg-background text-[10px] font-bold text-muted-foreground pointer-events-none">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 border-l border-border/50 pl-3">
              <ModeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="h-8 w-8 rounded-full bg-secondary border border-border/50 flex items-center justify-center hover:border-primary/30 transition-colors cursor-pointer overflow-hidden"
                    title="Account"
                  >
                    {user?.name ? (
                      <span className="text-[10px] font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border/50 shadow-xl">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user?.name || 'Guest'}</p>
                      <p className="text-[11px] leading-none text-muted-foreground font-medium">{user?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem 
                    className="py-2.5 font-semibold text-[13px] cursor-pointer"
                    onClick={() => setIsConfigOpen(true)}
                  >
                    System Config
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem 
                    className="py-2.5 font-bold text-[13px] text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={logout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto relative bg-background">
          {children}
        </div>
      </main>
      <SystemConfigDialog 
        open={isConfigOpen} 
        onOpenChange={setIsConfigOpen} 
        notebookId={activeNotebook?.id}
      />
      <Toaster />
    </div>
  );
};
