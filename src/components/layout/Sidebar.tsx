import React, { useState } from 'react';
import { 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Settings,
  Book,
  ChevronDown,
  Check,
  Plus,
  Archive,
  LayoutDashboard,
  MessageSquare,
  Search,
  Library,
  Database,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Notebook, ChatSession } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SystemConfigDialog } from './SystemConfigDialog';

interface SidebarProps {
  activeSection: 'overview' | 'chat' | 'documents';
  onSectionChange?: (section: 'overview' | 'chat' | 'documents') => void;
  onNewResearch?: () => void;
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  onNotebookSelect: (id: string) => void;
  onNotebookCreate: (title: string, description?: string) => Promise<any>;
  sessions: ChatSession[];
  activeSessionId: string | null;
  isTemporary: boolean;
  onSessionSelect: (id: string) => void;
  onSessionDelete: (id: string) => void;
  onSessionRename: (id: string, title: string) => void;
  onSessionPin: (id: string, isPinned: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  onNewResearch,
  notebooks,
  activeNotebook,
  onNotebookSelect,
  onNotebookCreate,
  sessions,
  activeSessionId,
  isTemporary,
  onSessionSelect,
  onSessionDelete,
  onSessionRename,
  onSessionPin
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [isCreateNotebookOpen, setIsCreateNotebookOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookDesc, setNewNotebookDesc] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;
    await onNotebookCreate(newNotebookTitle, newNotebookDesc);
    setIsCreateNotebookOpen(false);
    setNewNotebookTitle('');
    setNewNotebookDesc('');
  };

  const mainNav = [
    { icon: LayoutDashboard, label: 'Overview', section: 'overview' as const },
    { icon: FileText, label: 'Knowledge Base', section: 'documents' as const },
  ];

  return (
    <>
      <aside 
        className={cn(
          "hidden md:flex h-screen border-r border-border/50 bg-card flex-col transition-all duration-300 relative z-40 shadow-xl shadow-black/10",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className={cn("p-4 flex items-center gap-3 h-14 border-b border-border/50", collapsed && "justify-center px-0")}>
          {!collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-2 hover:bg-muted/50 h-10 border border-border/20 group">
                  <div className="flex items-center gap-2 truncate">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Book className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-bold text-sm truncate text-foreground/90">{activeNotebook?.title || 'Select Notebook'}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-popover border-border/50 shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-3 py-2">Notebook Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/30" />
                <div className="max-h-[300px] overflow-auto py-1">
                  {notebooks.map(nb => (
                    <DropdownMenuItem 
                      key={nb.id} 
                      onClick={() => onNotebookSelect(nb.id)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer py-2 px-3 m-1 rounded-md transition-colors",
                        activeNotebook?.id === nb.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      <span className="truncate font-semibold">{nb.title}</span>
                      {activeNotebook?.id === nb.id && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="bg-border/30" />
                <DropdownMenuItem onClick={() => setIsCreateNotebookOpen(true)} className="cursor-pointer text-primary font-bold py-2 px-3 m-1 rounded-md hover:bg-primary/5">
                  <Plus className="h-4 w-4 mr-2" />
                  New Notebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Book className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-2">
          <Button
            variant="default"
            size="sm"
            className="w-full justify-center gap-2 bg-primary text-primary-foreground text-[11px] font-bold h-9 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-wider"
            onClick={() => {
              onNewResearch?.();
              onSectionChange?.('chat');
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {!collapsed && <span>New Chat</span>}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 border-border/50 bg-secondary/20 text-muted-foreground text-[10px] font-bold h-8 hover:bg-secondary/40 transition-all uppercase tracking-wider"
            onClick={() => {
              if (onNewResearch) (onNewResearch as any)(true); // Pass true for temporary
              onSectionChange?.('chat');
            }}
          >
            <Archive className="h-3 w-3" />
            {!collapsed && <span>Temporary Chat</span>}
          </Button>
        </div>


        <nav className="px-3 space-y-1">
          {mainNav.map((item) => {
            const active = 'section' in item && item.section === activeSection;
            return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if ('section' in item && item.section) onSectionChange?.(item.section);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all group relative",
                active 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110", active ? "text-primary" : "")} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
              )}
            </button>
          )})}
        </nav>

        {!collapsed && sessions.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 mt-8 px-3">
            <div className="px-4 mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">Recent History</span>
              <Archive className="h-3 w-3 text-muted-foreground/30" />
            </div>
            <ScrollArea className="flex-1 -mx-3 px-3">
              <div className="space-y-0.5 pb-6">
                {(activeSection === 'chat' && !activeSessionId) && (
                  <div className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[12px] bg-primary/5 text-primary font-bold border border-primary/20 mb-2 animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
                    <span className="truncate italic">{isTemporary ? 'Temporary Chat' : 'New Chat'}</span>
                  </div>
                )}
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all text-left truncate group relative",
                      activeSessionId === session.id 
                        ? "bg-muted/80 text-foreground font-bold border border-border/50" 
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground font-medium"
                    )}
                  >
                    <button
                      onClick={() => {
                        onSessionSelect(session.id);
                        onSectionChange?.('chat');
                      }}
                      className="flex-1 flex items-center gap-2.5 truncate"
                    >
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0 transition-all", 
                        activeSessionId === session.id ? "bg-primary scale-125 shadow-[0_0_8px_rgba(20,184,166,0.4)]" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50",
                        session.isPinned && "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                      )} />
                      {editingSessionId === session.id ? (
                        <input
                          autoFocus
                          className="bg-transparent border-none outline-none w-full p-0 text-[12px] font-bold text-foreground"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => {
                            if (editingTitle.trim() && editingTitle !== session.title) {
                              onSessionRename(session.id, editingTitle);
                            }
                            setEditingSessionId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingTitle.trim() && editingTitle !== session.title) {
                                onSessionRename(session.id, editingTitle);
                              }
                              setEditingSessionId(null);
                            }
                            if (e.key === 'Escape') setEditingSessionId(null);
                          }}
                        />
                      ) : (
                        <span className="truncate flex items-center gap-1.5">
                          {session.title}
                          {session.isPinned && <Pin className="h-2.5 w-2.5 text-amber-400 rotate-45" />}
                        </span>
                      )}
                    </button>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => {
                            setEditingSessionId(session.id);
                            setEditingTitle(session.title);
                          }} className="gap-2 text-[11px] font-bold">
                            <Pencil className="h-3.5 w-3.5" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSessionPin(session.id, !session.isPinned)} className="gap-2 text-[11px] font-bold">
                            {session.isPinned ? <><PinOff className="h-3.5 w-3.5" /> Unpin</> : <><Pin className="h-3.5 w-3.5" /> Pin</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onSessionDelete(session.id)}
                            className="gap-2 text-[11px] font-bold text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {(!sessions.length || collapsed) && <div className="flex-1" />}

        <div className="p-4 border-t border-border/50 bg-background/50">
          <button
            onClick={() => setIsConfigOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all group"
            )}
          >
            <Settings className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-45 duration-500" />
            {!collapsed && <span>System Config</span>}
          </button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-border bg-background shadow-md z-50 hover:bg-primary/10 hover:text-primary transition-all hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>

      <Dialog open={isCreateNotebookOpen} onOpenChange={setIsCreateNotebookOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-border/50 bg-background/50">
            <DialogTitle className="text-xl font-bold tracking-tight">Create Research Notebook</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 p-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notebook Name</label>
              <input
                id="title"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                placeholder="e.g. Q2 Market Analysis"
                className="flex h-11 w-full rounded-lg border border-border/50 bg-secondary/20 px-4 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-secondary/40 placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="desc" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description (Optional)</label>
              <textarea
                id="desc"
                value={newNotebookDesc}
                onChange={(e) => setNewNotebookDesc(e.target.value)}
                placeholder="Project goals, scope, and key documentation..."
                className="flex min-h-[100px] w-full rounded-lg border border-border/50 bg-secondary/20 px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-secondary/40 placeholder:text-muted-foreground/30 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="p-6 border-t border-border/50 bg-background/50 gap-2">
            <Button variant="ghost" onClick={() => setIsCreateNotebookOpen(false)} className="font-semibold">Cancel</Button>
            <Button onClick={handleCreateNotebook} disabled={!newNotebookTitle.trim()} className="px-6 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/10">Create Notebook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SystemConfigDialog 
        open={isConfigOpen} 
        onOpenChange={setIsConfigOpen} 
        notebookId={activeNotebook?.id}
      />
    </>
  );
};
