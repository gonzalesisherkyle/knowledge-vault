import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DocumentTable } from '@/features/documents/DocumentTable';
import { DocumentUpload } from '@/features/documents/DocumentUpload';
import { ChatWindow } from '@/features/chat/ChatWindow';
import { Overview } from '@/features/overview/Overview';
import { useDocuments } from '@/features/documents/useDocuments';
import { useNotebooks } from '@/features/notebooks/useNotebooks';
import { useChat } from '@/features/chat/useChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Database, Sparkles, Binary, RefreshCcw, Info, Activity, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { healthApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const { 
    notebooks, 
    activeNotebookId, 
    activeNotebook, 
    selectNotebook, 
    createNotebook 
  } = useNotebooks();
  
  const { 
    documents, 
    isLoading, 
    refresh, 
    uploadDocument, 
    deleteDocument 
  } = useDocuments(activeNotebookId);

  const {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    isLoadingHistory,
    currentSources,
    sendMessage,
    loadSession,
    clearChat,
    isTemporary,
    deleteSession,
    renameSession,
    togglePinSession
  } = useChat(activeNotebookId);

  const [isRagHealthy, setIsRagHealthy] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'chat' | 'documents'>('overview');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    let mounted = true;

    healthApi.getRagHealth().then((response) => {
      if (mounted) {
        setIsRagHealthy(Boolean(response.success && response.data?.ok));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredDocuments = documents.filter((document) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      document.filename.toLowerCase().includes(query) ||
      document.fileType.toLowerCase().includes(query) ||
      document.status.toLowerCase().includes(query)
    );
  });

  return (
    <AppShell
      activeSection={activeTab}
      onSectionChange={setActiveTab}
      onNewResearch={clearChat}
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        if (value.trim()) setActiveTab('documents');
      }}
      notebooks={notebooks}
      activeNotebook={activeNotebook}
      onNotebookSelect={selectNotebook}
      onNotebookCreate={createNotebook}
      sessions={sessions}
      activeSessionId={activeSessionId}
      isTemporary={isTemporary}
      onSessionSelect={loadSession}
      onSessionDelete={deleteSession}
      onSessionRename={renameSession}
      onSessionPin={togglePinSession}
    >
      <div className="h-full flex flex-col bg-background">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'chat' | 'documents')} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 md:px-10 py-4 bg-card/30 border-b border-border/50">
            <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all",
                    isRagHealthy 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    <Activity className="h-2.5 w-2.5" />
                    {isRagHealthy ? 'Operational' : 'Degraded'}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-border/50 bg-secondary/30 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <ShieldCheck className="h-2.5 w-2.5" /> Secure Vault
                  </div>
                </div>
                
                <div className="space-y-0.5">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                    {activeNotebook?.title || 'Knowledge Research'}
                  </h1>
                  <p className="text-muted-foreground text-[11px] font-medium max-w-xl line-clamp-1">
                    {activeNotebook?.description || 'Your intelligent workspace for document analysis and knowledge synthesis.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <TabsList className="bg-secondary/50 border border-border/50 p-1 rounded-xl h-9">
                  <TabsTrigger 
                    value="overview" 
                    className="gap-2 px-4 py-1 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all rounded-lg h-7"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Vault
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat" 
                    className="gap-2 px-4 py-1 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all rounded-lg h-7"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Notebook
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="gap-2 px-4 py-1 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all rounded-lg h-7"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Library
                  </TabsTrigger>
                </TabsList>
                
                <Button
                  variant="outline"
                  onClick={refresh}
                  disabled={isLoading}
                  className="h-9 px-3 gap-2 border-border/50 bg-background/50 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/50"
                >
                  <RefreshCcw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                  Sync
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="flex-1 overflow-auto m-0 focus-visible:outline-none">
            <Overview 
              notebook={activeNotebook}
              documentCount={documents.length}
              sessionCount={sessions.length}
              onStartChat={() => setActiveTab('chat')}
              onUploadClick={() => setActiveTab('documents')}
            />
          </TabsContent>

          <TabsContent value="chat" className="flex-1 overflow-hidden m-0 focus-visible:outline-none bg-background">
            <ChatWindow 
              messages={messages}
              isTyping={isTyping}
              isLoadingHistory={isLoadingHistory}
              currentSources={currentSources}
              onSendMessage={sendMessage}
              notebookId={activeNotebookId}
            />
          </TabsContent>

          <TabsContent value="documents" className="flex-1 overflow-auto m-0 focus-visible:outline-none">
            <div className="max-w-screen-2xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-8">
                  <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold tracking-tight">Research Library</h3>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">Manage and organize your research materials</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Sources</p>
                          <p className="text-xl font-bold font-mono text-foreground/80 leading-none mt-1">{filteredDocuments.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden shadow-2xl shadow-black/10">
                      <DocumentTable 
                        documents={filteredDocuments} 
                        isLoading={isLoading} 
                        onDelete={deleteDocument} 
                      />
                    </div>
                  </section>
                </div>

                <div className="xl:col-span-4 space-y-10">
                  <DocumentUpload onUpload={uploadDocument} disabled={!activeNotebookId} />
                  
                  <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
                    <div className="p-6 border-b border-border/50 bg-background/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Binary className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
                          Intelligence Metrics
                        </h4>
                      </div>
                      <Info className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                    
                    <div className="p-6 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2">Total Vectors</p>
                          <p className="text-2xl font-bold font-mono text-primary">
                            {filteredDocuments.reduce((acc, doc) => acc + (doc.totalChunks || 0), 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2">Ready State</p>
                          <p className="text-2xl font-bold font-mono text-foreground/80">
                            {filteredDocuments.filter((doc) => doc.status === 'ready').length}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-muted-foreground">Indexing Completion</span>
                          <span className="text-primary font-mono text-xs">
                            {filteredDocuments.length
                              ? `${Math.round((filteredDocuments.filter((doc) => doc.status === 'ready').length / filteredDocuments.length) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2 border border-border/30 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                            style={{
                              width: filteredDocuments.length
                                ? `${Math.round((filteredDocuments.filter((doc) => doc.status === 'ready').length / filteredDocuments.length) * 100)}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-[11px] font-medium text-muted-foreground leading-snug">
                          Your knowledge graph is synchronized and optimized for semantic cross-referencing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};
