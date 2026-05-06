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
  FileIcon, 
  Trash2, 
  RefreshCcw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreHorizontal,
  FileText,
  FileCode,
  FileJson,
  Link2,
  Binary,
  Database
} from 'lucide-react';
import type { Document, DocumentStatus } from '@/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean> | boolean | void;
}

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  switch (status) {
    case 'ready':
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          <CheckCircle2 className="h-3 w-3" /> Indexed
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="outline" className="bg-secondary text-foreground/80 border-border/50 gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <RefreshCcw className="h-3 w-3 animate-spin" /> Processing
        </Badge>
      );
    case 'queued':
      return (
        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border/50 gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          <Clock className="h-3 w-3" /> Queued
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          <AlertCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const FileTypeIcon: React.FC<{ type: string; sourceType?: Document['sourceType'] }> = ({ type, sourceType }) => {
  if (sourceType === 'url') return <Link2 className="h-4 w-4 text-primary/80" />;
  const t = type.toLowerCase();
  if (t.includes('pdf')) return <FileText className="h-4 w-4 text-primary/80" />;
  if (t.includes('json')) return <FileJson className="h-4 w-4 text-muted-foreground" />;
  if (t.includes('text') || t.includes('txt')) return <FileIcon className="h-4 w-4 text-muted-foreground" />;
  if (t.includes('code') || t.includes('js') || t.includes('ts')) return <FileCode className="h-4 w-4 text-muted-foreground" />;
  return <Binary className="h-4 w-4 text-muted-foreground/50" />;
};

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents, isLoading, onDelete }) => {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (deleteId) {
      setIsDeleting(true);
      const result = await onDelete(deleteId);
      setIsDeleting(false);
      if (result !== false) setDeleteId(null);
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="space-y-4 p-6 bg-card border border-border/50 rounded-2xl">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-secondary/30" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border/50">
        <div className="h-16 w-16 rounded-2xl bg-secondary/30 flex items-center justify-center mb-6">
          <Database className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground/80">Library is empty</h3>
        <p className="text-muted-foreground text-sm max-w-[300px] text-center mt-2 leading-relaxed font-medium">
          Upload research documents, notes, or URLs to start building this workspace's knowledge graph.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl shadow-black/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-b border-border/50">
            <TableHead className="w-[400px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-12">Document Name</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Vectors</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Added On</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="group hover:bg-secondary/20 transition-colors border-b border-border/30 last:border-0 h-16">
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg border border-border/50 bg-background flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                    <FileTypeIcon type={doc.fileType} sourceType={doc.sourceType} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-foreground truncate max-w-[320px]">{doc.filename}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                      {doc.sourceType === 'url' ? doc.sourceUrl || 'URL' : doc.fileType}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={doc.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-foreground/80">
                    {doc.totalChunks?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Chunks</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-[12px] font-medium">
                  {format(new Date(doc.createdAt), 'MMM dd, HH:mm')}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border/50 shadow-xl">
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 font-medium py-2" onClick={() => setDeleteId(doc.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Document
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <DialogContent className="bg-card border-border/50 max-w-md shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-border/50 bg-background/50">
            <DialogTitle className="text-xl font-bold tracking-tight">Remove Document</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2 font-medium">
              Are you sure you want to remove this document? This will delete all associated semantic vectors from this workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 bg-background/50 gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="font-bold shadow-lg shadow-destructive/20"
            >
              {isDeleting ? 'Removing...' : 'Remove Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
