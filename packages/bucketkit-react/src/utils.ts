import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID for upload items
 */
export function generateUploadId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

/**
 * Parse accept string to array of MIME types/extensions
 */
export function parseAccept(accept: string | string[] | undefined): string {
  if (!accept) {
    return "";
  }
  if (Array.isArray(accept)) {
    return accept.join(",");
  }
  return accept;
}

/**
 * Check if a file matches the accept criteria
 */
export function fileMatchesAccept(
  file: File,
  accept: string | string[] | undefined
): boolean {
  if (!accept) {
    return true;
  }

  const acceptArray = Array.isArray(accept)
    ? accept
    : accept.split(",").map((s) => s.trim());

  for (const pattern of acceptArray) {
    // Extension match (e.g., ".jpg")
    if (pattern.startsWith(".")) {
      if (file.name.toLowerCase().endsWith(pattern.toLowerCase())) {
        return true;
      }
    }
    // MIME type match (e.g., "image/*" or "image/jpeg")
    else if (pattern.includes("/")) {
      if (pattern.endsWith("/*")) {
        const prefix = pattern.slice(0, -1);
        if (file.type.startsWith(prefix)) {
          return true;
        }
      } else if (file.type === pattern) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filter files by size and type
 */
export function filterFiles(
  files: File[],
  options: {
    accept?: string | string[];
    maxSize?: number;
  }
): { valid: File[]; rejected: Array<{ file: File; reason: string }> } {
  const valid: File[] = [];
  const rejected: Array<{ file: File; reason: string }> = [];

  for (const file of files) {
    if (options.maxSize && file.size > options.maxSize) {
      rejected.push({
        file,
        reason: `File too large (max ${formatBytes(options.maxSize)})`,
      });
      continue;
    }

    if (options.accept && !fileMatchesAccept(file, options.accept)) {
      rejected.push({
        file,
        reason: "File type not accepted",
      });
      continue;
    }

    valid.push(file);
  }

  return { valid, rejected };
}
