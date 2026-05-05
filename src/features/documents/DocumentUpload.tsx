import React, { useState, useCallback } from 'react';
import { CloudUpload, X, FileIcon, Loader2, FilePlus2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<any>;
  disabled?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const maxUploadMb = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 25);
  const maxUploadBytes = maxUploadMb * 1024 * 1024;

  const selectFile = useCallback((nextFile: File) => {
    if (disabled) return;
    if (nextFile.size > maxUploadBytes) {
      setFile(null);
      setFileError(`File is larger than ${maxUploadMb}MB.`);
      return;
    }
    setFileError(null);
    setFile(nextFile);
  }, [maxUploadBytes, maxUploadMb, disabled]);

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
                Supported formats: PDF, DOCX, TXT, MD, CSV (Max {maxUploadMb}MB)
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
              accept=".pdf,.docx,.txt,.md,.csv,.tsv,.json,.xml,.html,.htm"
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
      </div>
    </div>
  );
};
