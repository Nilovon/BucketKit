import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  BucketKitContextValue,
  BucketKitProviderOptions,
  PresignedUrlResponse,
  UploadItem,
} from "./types.js";
import { generateUploadId } from "./utils.js";

const BucketKitContext = createContext<BucketKitContextValue | null>(null);

/**
 * Hook to access BucketKit context
 *
 * @throws Error if used outside of BucketKitProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { items, uploadFiles, isUploading } = useBucketKit();
 *
 *   return (
 *     <div>
 *       {isUploading && <p>Uploading...</p>}
 *       {items.map(item => (
 *         <div key={item.id}>{item.fileName}: {item.progress}%</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBucketKit(): BucketKitContextValue {
  const context = useContext(BucketKitContext);
  if (!context) {
    throw new Error("useBucketKit must be used within a BucketKitProvider");
  }
  return context;
}

interface BucketKitProviderProps extends BucketKitProviderOptions {
  children: ReactNode;
}

/**
 * Provider component for BucketKit
 *
 * Wrap your app or a section of your app with this provider to enable
 * file upload functionality.
 *
 * @example
 * ```tsx
 * <BucketKitProvider
 *   endpoint="/api/upload"
 *   onUploadComplete={(item) => console.log('Uploaded:', item.url)}
 *   onError={(error) => console.error('Upload failed:', error)}
 * >
 *   <YourApp />
 * </BucketKitProvider>
 * ```
 */
export function BucketKitProvider({
  children,
  endpoint,
  headers,
  onUploadComplete,
  onError,
  autoUpload = true,
  maxConcurrent = 3,
}: BucketKitProviderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const uploadQueueRef = useRef<Set<string>>(new Set());

  const options: BucketKitProviderOptions = useMemo(
    () => ({
      endpoint,
      headers,
      onUploadComplete,
      onError,
      autoUpload,
      maxConcurrent,
    }),
    [endpoint, headers, onUploadComplete, onError, autoUpload, maxConcurrent]
  );

  // Update item in state
  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Get presigned URL from server
  const getPresignedUrl = useCallback(
    async (file: File): Promise<PresignedUrlResponse> => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error || error.message || "Failed to get upload URL"
        );
      }

      return response.json();
    },
    [endpoint, headers]
  );

  // Upload a single file
  const uploadFile = useCallback(
    async (item: UploadItem) => {
      const abortController = new AbortController();
      abortControllers.current.set(item.id, abortController);

      try {
        // Update status to uploading
        updateItem(item.id, { status: "uploading", progress: 0 });

        // Get presigned URL
        const presigned = await getPresignedUrl(item.file);

        // Upload to S3 using XMLHttpRequest for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              updateItem(item.id, { progress });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload cancelled"));
          });

          // Handle abort signal
          abortController.signal.addEventListener("abort", () => {
            xhr.abort();
          });

          xhr.open(presigned.method, presigned.url);

          // Set headers
          for (const [key, value] of Object.entries(presigned.headers)) {
            xhr.setRequestHeader(key, value);
          }

          xhr.send(item.file);
        });

        // Update status to complete
        updateItem(item.id, {
          status: "complete",
          progress: 100,
          url: presigned.publicUrl,
          key: presigned.key,
        });

        // Call success callback
        const completedItem: UploadItem = {
          ...item,
          status: "complete",
          progress: 100,
          url: presigned.publicUrl,
          key: presigned.key,
        };
        onUploadComplete?.(completedItem);
      } catch (error) {
        if ((error as Error).message === "Upload cancelled") {
          updateItem(item.id, { status: "error", error: "Cancelled" });
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          updateItem(item.id, { status: "error", error: errorMessage });
          onError?.(
            error instanceof Error ? error : new Error(errorMessage),
            item
          );
        }
      } finally {
        abortControllers.current.delete(item.id);
        uploadQueueRef.current.delete(item.id);
      }
    },
    [getPresignedUrl, updateItem, onUploadComplete, onError]
  );

  // Process upload queue
  const processQueue = useCallback(async () => {
    const queuedItems = items.filter(
      (item) => item.status === "queued" && !uploadQueueRef.current.has(item.id)
    );
    const uploadingCount = items.filter(
      (item) => item.status === "uploading"
    ).length;
    const slotsAvailable = maxConcurrent - uploadingCount;

    const itemsToUpload = queuedItems.slice(0, slotsAvailable);

    for (const item of itemsToUpload) {
      uploadQueueRef.current.add(item.id);
      uploadFile(item);
    }
  }, [items, maxConcurrent, uploadFile]);

  // Add files to queue
  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: UploadItem[] = files.map((file) => ({
        id: generateUploadId(),
        fileName: file.name,
        size: file.size,
        status: "queued" as const,
        progress: 0,
        contentType: file.type,
        file,
      }));

      setItems((prev) => [...prev, ...newItems]);

      if (autoUpload) {
        // Use setTimeout to ensure state is updated before processing
        setTimeout(() => processQueue(), 0);
      }
    },
    [autoUpload, processQueue]
  );

  // Upload files (either new files or queued items)
  const uploadFiles = useCallback(
    async (files?: File[]) => {
      if (files) {
        addFiles(files);
      }
      processQueue();
    },
    [addFiles, processQueue]
  );

  // Cancel upload
  const cancelUpload = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "error" as const, error: "Cancelled" }
          : item
      )
    );
  }, []);

  // Remove item
  const removeItem = useCallback(
    (id: string) => {
      cancelUpload(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [cancelUpload]
  );

  // Retry upload
  const retryUpload = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "queued" as const,
                progress: 0,
                error: undefined,
              }
            : item
        )
      );
      setTimeout(() => processQueue(), 0);
    },
    [processQueue]
  );

  // Clear completed items
  const clearCompleted = useCallback(() => {
    setItems((prev) =>
      prev.filter(
        (item) => item.status !== "complete" && item.status !== "error"
      )
    );
  }, []);

  // Compute derived state
  const isUploading = items.some((item) => item.status === "uploading");

  const progress = useMemo(() => {
    const relevantItems = items.filter(
      (item) => item.status === "uploading" || item.status === "complete"
    );
    if (relevantItems.length === 0) {
      return 0;
    }

    const totalProgress = relevantItems.reduce(
      (acc, item) => acc + item.progress,
      0
    );
    return Math.round(totalProgress / relevantItems.length);
  }, [items]);

  const contextValue: BucketKitContextValue = useMemo(
    () => ({
      items,
      isUploading,
      progress,
      addFiles,
      uploadFiles,
      cancelUpload,
      removeItem,
      retryUpload,
      clearCompleted,
      options,
    }),
    [
      items,
      isUploading,
      progress,
      addFiles,
      uploadFiles,
      cancelUpload,
      removeItem,
      retryUpload,
      clearCompleted,
      options,
    ]
  );

  return (
    <BucketKitContext.Provider value={contextValue}>
      {children}
    </BucketKitContext.Provider>
  );
}
