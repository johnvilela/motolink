"use client";

import { cva } from "class-variance-authority";
import { FileIcon, Trash2, Upload } from "lucide-react";
import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const ACCEPTED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_COUNT = 5;

export type FileInputItem = File | string;

export function isFileObject(item: FileInputItem): item is File {
  return item instanceof File;
}

export function extractFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const encoded = pathname.split("/").pop() || url;
    const decoded = decodeURIComponent(encoded);
    // UUID format: 8-4-4-4-12 chars = 36 chars + 1 hyphen = 37 chars prefix
    // Format: {uuid}-{filename}
    const uuidPattern =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-/i;
    if (uuidPattern.test(decoded)) {
      return decoded.replace(uuidPattern, "");
    }
    return decoded;
  } catch {
    return url;
  }
}

export type FileValidationErrorType =
  | "invalid-type"
  | "file-too-large"
  | "too-many-files"
  | "duplicate-file";

export interface FileValidationError {
  type: FileValidationErrorType;
  file: File;
  message: string;
}

export interface FileInputProps {
  value: FileInputItem[];
  onChange: (files: FileInputItem[]) => void;
  disabled?: boolean;
  error?: boolean;
  onValidationError?: (errors: FileValidationError[]) => void;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface ValidateFileResult {
  valid: File[];
  errors: FileValidationError[];
}

const validateFiles = (
  newFiles: File[],
  currentItems: FileInputItem[],
  options: {
    maxFileSize: number;
    maxFileCount: number;
  },
): ValidateFileResult => {
  const valid: File[] = [];
  const errors: FileValidationError[] = [];

  const acceptedMimeTypes = Object.keys(ACCEPTED_FILE_TYPES);
  const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat();

  const currentFiles = currentItems.filter(isFileObject);

  for (const file of newFiles) {
    const isDuplicate = currentFiles.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified,
    );

    if (isDuplicate) {
      errors.push({
        type: "duplicate-file",
        file,
        message: `"${file.name}" já foi adicionado`,
      });
      continue;
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidType =
      acceptedMimeTypes.includes(file.type) ||
      (acceptedExtensions as readonly string[]).includes(extension);

    if (!isValidType) {
      errors.push({
        type: "invalid-type",
        file,
        message: `"${file.name}" não é um tipo permitido. Use: JPG, PNG ou PDF`,
      });
      continue;
    }

    if (file.size > options.maxFileSize) {
      errors.push({
        type: "file-too-large",
        file,
        message: `"${file.name}" excede o tamanho máximo de ${formatFileSize(options.maxFileSize)}`,
      });
      continue;
    }

    valid.push(file);
  }

  const totalCount = currentItems.length + valid.length;
  if (totalCount > options.maxFileCount) {
    const allowedCount = options.maxFileCount - currentItems.length;
    const excessFiles = valid.splice(allowedCount);

    for (const file of excessFiles) {
      errors.push({
        type: "too-many-files",
        file,
        message: `Limite de ${options.maxFileCount} arquivos atingido`,
      });
    }
  }

  return { valid, errors };
};

const dropZoneVariants = cva(
  [
    "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors",
    "cursor-pointer",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
  ],
  {
    variants: {
      state: {
        default:
          "border-input bg-background hover:bg-accent/50 hover:border-accent-foreground/20",
        dragOver: "border-primary bg-primary/5",
        error: "border-destructive bg-destructive/5",
        disabled: "pointer-events-none cursor-not-allowed opacity-50 bg-muted",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export function FileInput({
  value,
  onChange,
  disabled = false,
  error = false,
  onValidationError,
  className,
  id,
  "aria-label": ariaLabel,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const acceptString = useMemo(() => {
    return [
      ...Object.keys(ACCEPTED_FILE_TYPES),
      ...Object.values(ACCEPTED_FILE_TYPES).flat(),
    ].join(",");
  }, []);

  const dropZoneState = useMemo(() => {
    if (disabled) return "disabled";
    if (error) return "error";
    if (isDragOver) return "dragOver";
    return "default";
  }, [disabled, error, isDragOver]);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const { valid, errors } = validateFiles(Array.from(files), value, {
        maxFileSize: MAX_FILE_SIZE,
        maxFileCount: MAX_FILE_COUNT,
      });

      if (errors.length > 0) {
        onValidationError?.(errors);
      }

      if (valid.length > 0) {
        onChange([...value, ...valid]);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [value, onChange, disabled, onValidationError],
  );

  const handleRemoveItem = useCallback(
    (itemToRemove: FileInputItem) => {
      onChange(value.filter((item) => item !== itemToRemove));
    },
    [value, onChange],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled],
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      handleFilesSelected(event.dataTransfer.files);
    },
    [disabled, handleFilesSelected],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFilesSelected(event.target.files);
    },
    [handleFilesSelected],
  );

  const canAddMore = value.length < MAX_FILE_COUNT;

  return (
    <div
      data-slot="file-input"
      className={cn("flex flex-col gap-3", className)}
    >
      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={acceptString}
        multiple
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* biome-ignore lint/a11y/useSemanticElements: using div with role=\"button\" as an accessible dropzone */}
      <div
        data-slot="file-input-dropzone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? "Área para selecionar ou arrastar arquivos"}
        aria-disabled={disabled}
        aria-invalid={error || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(dropZoneVariants({ state: dropZoneState }))}
      >
        <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium">
            Arraste arquivos ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou PDF - máximo {formatFileSize(MAX_FILE_SIZE)} por arquivo
          </p>
          {!canAddMore && (
            <p className="text-xs text-destructive">
              Limite de {MAX_FILE_COUNT} arquivos atingido
            </p>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <ul
          data-slot="file-input-list"
          className="flex flex-col gap-2"
          aria-label="Arquivos selecionados"
        >
          {value.map((item, index) =>
            isFileObject(item) ? (
              <FileItem
                key={`file-${item.name}-${item.size}-${item.lastModified}`}
                file={item}
                onRemove={handleRemoveItem}
                disabled={disabled}
              />
            ) : (
              <UrlItem
                key={`url-${index}-${item}`}
                url={item}
                onRemove={handleRemoveItem}
                disabled={disabled}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

interface FileItemProps {
  file: File;
  onRemove: (item: FileInputItem) => void;
  disabled: boolean;
}

const FileItem = React.memo(function FileItem({
  file,
  onRemove,
  disabled,
}: FileItemProps) {
  const handleRemove = useCallback(() => {
    onRemove(file);
  }, [file, onRemove]);

  return (
    <li
      data-slot="file-input-item"
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <FileIcon
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleRemove}
        disabled={disabled}
        aria-label={`Remover arquivo ${file.name}`}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
});

interface UrlItemProps {
  url: string;
  onRemove: (item: FileInputItem) => void;
  disabled: boolean;
}

const UrlItem = React.memo(function UrlItem({
  url,
  onRemove,
  disabled,
}: UrlItemProps) {
  const filename = extractFilenameFromUrl(url);

  const handleRemove = useCallback(() => {
    onRemove(url);
  }, [url, onRemove]);

  return (
    <li
      data-slot="file-input-item"
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <FileIcon
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{filename}</span>
        <span className="text-xs text-muted-foreground">Arquivo salvo</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleRemove}
        disabled={disabled}
        aria-label={`Remover arquivo ${filename}`}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
});
