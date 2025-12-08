import { useCallback, useMemo } from "react";
import { useBucketKit } from "./context.js";
import type { UploadItem, UploadItemActions } from "./types.js";

/**
 * Hook for managing file uploads
 *
 * This hook provides everything you need to handle file uploads in your components.
 *
 * @example
 * ```tsx
 * function UploadComponent() {
 *   const { uploadFiles, items, isUploading, progress } = useBucketKitUpload();
 *
 *   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const files = Array.from(e.target.files || []);
 *     uploadFiles(files);
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFileChange} multiple />
 *       {isUploading && <p>Uploading: {progress}%</p>}
 *       <ul>
 *         {items.map(item => (
 *           <li key={item.id}>
 *             {item.fileName}: {item.status} ({item.progress}%)
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBucketKitUpload() {
  const context = useBucketKit();

  return {
    /** Add and upload files */
    uploadFiles: context.uploadFiles,
    /** Add files to queue without starting upload */
    addFiles: context.addFiles,
    /** List of upload items */
    items: context.items,
    /** Whether any upload is in progress */
    isUploading: context.isUploading,
    /** Overall progress (0-100) */
    progress: context.progress,
    /** Cancel a specific upload */
    cancelUpload: context.cancelUpload,
    /** Remove an item from the list */
    removeItem: context.removeItem,
    /** Retry a failed upload */
    retryUpload: context.retryUpload,
    /** Clear all completed/errored items */
    clearCompleted: context.clearCompleted,
  };
}

/**
 * Hook for getting actions for a specific upload item
 *
 * @param itemId - The ID of the upload item
 *
 * @example
 * ```tsx
 * function UploadItemRow({ item }: { item: UploadItem }) {
 *   const actions = useUploadItemActions(item.id);
 *
 *   return (
 *     <div>
 *       <span>{item.fileName}</span>
 *       {item.status === 'uploading' && (
 *         <button onClick={actions.cancel}>Cancel</button>
 *       )}
 *       {item.status === 'error' && (
 *         <button onClick={actions.retry}>Retry</button>
 *       )}
 *       <button onClick={actions.remove}>Remove</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUploadItemActions(itemId: string): UploadItemActions {
  const { cancelUpload, removeItem, retryUpload } = useBucketKit();

  const cancel = useCallback(
    () => cancelUpload(itemId),
    [cancelUpload, itemId]
  );
  const remove = useCallback(() => removeItem(itemId), [removeItem, itemId]);
  const retry = useCallback(() => retryUpload(itemId), [retryUpload, itemId]);

  return useMemo(
    () => ({
      cancel,
      remove,
      retry,
    }),
    [cancel, remove, retry]
  );
}

/**
 * Hook for getting upload statistics
 *
 * @example
 * ```tsx
 * function UploadStats() {
 *   const stats = useUploadStats();
 *
 *   return (
 *     <div>
 *       <p>Queued: {stats.queued}</p>
 *       <p>Uploading: {stats.uploading}</p>
 *       <p>Complete: {stats.complete}</p>
 *       <p>Errors: {stats.error}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUploadStats() {
  const { items } = useBucketKit();

  return useMemo(() => {
    const stats = {
      total: items.length,
      queued: 0,
      uploading: 0,
      complete: 0,
      error: 0,
      totalBytes: 0,
      uploadedBytes: 0,
    };

    for (const item of items) {
      stats[item.status] += 1;
      stats.totalBytes += item.size;
      if (item.status === "complete") {
        stats.uploadedBytes += item.size;
      } else if (item.status === "uploading") {
        stats.uploadedBytes += (item.size * item.progress) / 100;
      }
    }

    return stats;
  }, [items]);
}

/**
 * Hook for getting completed uploads
 *
 * @example
 * ```tsx
 * function CompletedUploads() {
 *   const completed = useCompletedUploads();
 *
 *   return (
 *     <div>
 *       <h3>Uploaded Files</h3>
 *       {completed.map(item => (
 *         <a key={item.id} href={item.url}>{item.fileName}</a>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCompletedUploads(): UploadItem[] {
  const { items } = useBucketKit();

  return useMemo(
    () => items.filter((item) => item.status === "complete"),
    [items]
  );
}
