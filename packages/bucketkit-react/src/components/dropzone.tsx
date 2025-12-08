import { type DragEvent, type ReactNode, useCallback, useState } from "react";
import { useBucketKit } from "../context.js";
import type { BucketKitDropzoneProps } from "../types.js";
import { cn, filterFiles, parseAccept } from "../utils.js";

/**
 * Dropzone component for drag-and-drop file uploads
 *
 * @example
 * ```tsx
 * <BucketKitDropzone
 *   multiple
 *   accept={['image/*', 'application/pdf']}
 *   maxSize={10 * 1024 * 1024}
 * >
 *   <p>Drag files here or click to select</p>
 * </BucketKitDropzone>
 * ```
 */
export function BucketKitDropzone({
  multiple = true,
  accept,
  maxSize,
  disabled = false,
  className,
  children,
  dragActiveContent,
  onFilesSelected,
}: BucketKitDropzoneProps) {
  const { addFiles } = useBucketKit();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = useCallback(
    (files: File[]) => {
      const { valid, rejected } = filterFiles(files, { accept, maxSize });

      if (rejected.length > 0) {
        console.warn("BucketKit: Some files were rejected:", rejected);
      }

      if (valid.length > 0) {
        addFiles(valid);
        onFilesSelected?.(valid);
      }
    },
    [accept, maxSize, addFiles, onFilesSelected]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragActive(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragActive(true);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) {
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      const filesToAdd = multiple ? files : files.slice(0, 1);
      handleFiles(filesToAdd);
    },
    [disabled, multiple, handleFiles]
  );

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = parseAccept(accept);

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      handleFiles(files);
    };

    input.click();
  }, [disabled, multiple, accept, handleFiles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const defaultContent: ReactNode = (
    <div className="flex flex-col items-center gap-2 text-center">
      <svg
        className="h-10 w-10 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      </svg>
      <div className="text-muted-foreground text-sm">
        <span className="font-medium text-foreground">Click to upload</span> or
        drag and drop
      </div>
      {accept && (
        <p className="text-muted-foreground text-xs">
          {Array.isArray(accept) ? accept.join(", ") : accept}
        </p>
      )}
    </div>
  );

  const dragContent: ReactNode = dragActiveContent || (
    <div className="flex flex-col items-center gap-2 text-center">
      <svg
        className="h-10 w-10 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
      <div className="font-medium text-primary text-sm">Drop files here</div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {isDragActive ? dragContent : children || defaultContent}
    </div>
  );
}
