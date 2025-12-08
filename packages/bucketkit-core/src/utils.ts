import type { PathResolverParams } from "./types.js";

/**
 * Generate a unique ID for file naming
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

/**
 * Sanitize a filename for safe storage
 * Removes or replaces problematic characters
 */
export function sanitizeFileName(fileName: string): string {
  // Get extension and name separately
  const lastDotIndex = fileName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;
  const name = hasExtension ? fileName.slice(0, lastDotIndex) : fileName;
  const extension = hasExtension ? fileName.slice(lastDotIndex) : "";

  // Sanitize the name part
  const sanitizedName = name
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Remove any characters that aren't alphanumeric, hyphens, or underscores
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    // Remove consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, "")
    // Limit length
    .slice(0, 100);

  // Sanitize extension
  const sanitizedExtension = extension.toLowerCase().replace(/[^a-z0-9.]/g, "");

  return sanitizedName + sanitizedExtension || "file";
}

/**
 * Default path resolver that creates organized storage paths
 */
export function defaultPathResolver(params: PathResolverParams): string {
  const { fileName, userId } = params;
  const uniqueId = generateUniqueId();
  const sanitizedName = sanitizeFileName(fileName);

  if (userId) {
    return `uploads/${userId}/${uniqueId}-${sanitizedName}`;
  }

  return `uploads/${uniqueId}-${sanitizedName}`;
}

/**
 * Check if a MIME type matches a pattern
 * Supports wildcards like 'image/*'
 */
export function mimeTypeMatches(mimeType: string, pattern: string): boolean {
  // Exact match
  if (mimeType === pattern) {
    return true;
  }

  // Wildcard match (e.g., 'image/*')
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1); // 'image/'
    return mimeType.startsWith(prefix);
  }

  return false;
}

/**
 * Check if a MIME type is allowed by any of the patterns
 */
export function isMimeTypeAllowed(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some((pattern) => mimeTypeMatches(mimeType, pattern));
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return "";
  }
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}
