"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ACCEPT_STRING = ".jpg,.jpeg,.png,.pdf";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isDuplicate(existing: (File | string)[], entry: File | string): boolean {
  if (typeof entry === "string") {
    return existing.some((e) => typeof e === "string" && e === entry);
  }
  return existing.some((e) => e instanceof File && e.name === entry.name && e.size === entry.size);
}

function isValidFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

interface FileInputProps {
  value: (File | string)[];
  onChange: (value: (File | string)[]) => void;
  multiple?: boolean;
  className?: string;
}

export function FileInput({ value, onChange, multiple = true, className }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (files: FileList) => {
      const valid = Array.from(files).filter(isValidFile);
      if (valid.length === 0) return;

      if (!multiple) {
        onChange([valid[0]]);
        return;
      }

      const unique = valid.filter((f) => !isDuplicate(value, f));
      if (unique.length > 0) {
        onChange([...value, ...unique]);
      }
    },
    [value, onChange, multiple],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  return (
    <div data-slot="file-input" className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 bg-muted/50 hover:border-muted-foreground/50",
        )}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {multiple
            ? "Arraste arquivos aqui ou clique para selecionar"
            : "Arraste um arquivo aqui ou clique para selecionar"}
        </p>
        <p className="text-xs text-muted-foreground/70">JPG, JPEG, PNG ou PDF (máx. 5MB)</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {value.length > 0 && (
        <TooltipProvider>
          <ul data-slot="file-input-list" className="space-y-1">
            {value.map((entry, index) => {
              const isFile = entry instanceof File;
              const name = isFile ? entry.name : entry;
              const size = isFile ? formatFileSize(entry.size) : "—";

              return (
                <li
                  key={isFile ? `${entry.name}-${entry.size}` : entry}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate">{name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">{size}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemove(index)}
                          aria-label="Remover arquivo"
                        >
                          <X className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remover arquivo</TooltipContent>
                    </Tooltip>
                  </div>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      )}
    </div>
  );
}
