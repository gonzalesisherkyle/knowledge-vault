import React, { useState, useCallback } from 'react';
import { CloudUpload, X, FileIcon, Loader2, FilePlus2, Link2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<any>;
  onImportUrl: (url: string) => Promise<any>;
  disabled?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, onImportUrl, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const maxUploadMb = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 25);

  const selectFile = useCallback((nextFile: File) => {
    if (disabled) return;
    
    const isMedia = nextFile.type.startsWith('audio/') || 
                    nextFile.type.startsWith('video/') || 
                    /\.(mp3|wav|m4a|ogg|flac|mp4|mov|avi|mkv|webm)$/i.test(nextFile.name);
    
    const limitMb = isMedia ? 15 : maxUploadMb;
    const limitBytes = limitMb * 1024 * 1024;

    if (nextFile.size > limitBytes) {
      setFile(null);
      setFileError(`${isMedia ? 'Audio/Video' : 'File'} is larger than ${limitMb}MB.`);
      return;
    }
    setFileError(null);
    setFile(nextFile);
  }, [maxUploadMb, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) selectFile(droppedFile);
  }, [selectFile, disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const selectedFile = e.target.files?.[0];
    if (selectedFile) selectFile(selectedFile);
  }, [selectFile, disabled]);

  const handleSubmit = async () => {
    if (!file || disabled) return;
    setIsUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || isImportingUrl) return;

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      setUrlError('Enter a valid URL.');
      return;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      setUrlError('Only HTTP and HTTPS URLs are supported.');
      return;
    }

    setUrlError(null);
    setIsImportingUrl(true);
    try {
      const result = await onImportUrl(parsed.toString());
      if (result) setUrl('');
    } finally {
      setIsImportingUrl(false);
    }
  };

  return (
    <div className={cn("bg-card border border-border/50 rounded-2xl shadow-xl shadow-black/10 overflow-hidden", disabled && "opacity-50 pointer-events-none")}>
      <div className="p-6 border-b border-border/50 bg-background/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <CloudUpload className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Add to Library
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 border border-border/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
          <Lock className="h-3 w-3" /> Secure
        </div>
      </div>
      
      <div className="p-6">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group relative bg-secondary/20",
              isDragging 
                ? "border-primary bg-primary/5 scale-[0.99]" 
                : "border-border/60 hover:border-primary/40 hover:bg-secondary/40",
              disabled && "cursor-not-allowed"
            )}
          >
            <div className="h-12 w-12 rounded-xl bg-background border border-border/50 flex items-center justify-center group-hover:border-primary/40 transition-colors shadow-sm">
              <FilePlus2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-foreground">Select or drag files here</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                PDF, DOCX, TXT, Media (Audio/Video 15MB max)
              </p>
              {fileError && (
                <p className="text-[11px] text-destructive font-bold pt-2">
                  {fileError}
                </p>
              )}
            </div>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.md,.csv,.tsv,.json,.xml,.html,.htm,audio/*,video/*"
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="border border-border/50 rounded-xl p-4 bg-secondary/30 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-10 w-10 rounded border border-border/50 bg-background flex items-center justify-center shadow-sm shrink-0">
                <FileIcon className="h-5 w-5 text-primary/80" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5 truncate">
                  {(file.size / 1024).toFixed(1)} KB • {
                    file.type.includes('wordprocessingml') ? 'DOCX' : 
                    file.type.includes('pdf') ? 'PDF' : 
                    file.type.split('/')[1]?.toUpperCase() || 'DOC'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 shrink-0">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setFileError(null);
                  }}
                  disabled={disabled}
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {file && (
          <Button
            className="w-full mt-4 h-11 gap-2 text-xs font-bold transition-all duration-300 shadow-md shadow-primary/20"
            onClick={handleSubmit}
            disabled={isUploading || disabled}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                Import Document
              </>
            )}
          </Button>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">or add URL</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder="https://example.com/research"
              disabled={disabled || isImportingUrl}
              className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-secondary/30 disabled:cursor-not-allowed"
            />
          </div>
          {urlError && (
            <p className="text-[11px] text-destructive font-bold">
              {urlError}
            </p>
          )}
          <Button
            type="submit"
            variant="outline"
            className="w-full h-10 gap-2 text-xs font-bold border-border/60 bg-background/60 hover:bg-secondary/50"
            disabled={disabled || isImportingUrl || !url.trim()}
          >
            {isImportingUrl ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing URL...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Import URL
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
