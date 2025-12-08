/**
 * Status of an upload item
 */
export type UploadStatus = "queued" | "uploading" | "complete" | "error";

/**
 * Represents a file being uploaded
 */
export type UploadItem = {
  /** Unique identifier for this upload */
  id: string;
  /** Original filename */
  fileName: string;
  /** File size in bytes */
  size: number;
  /** Current upload status */
  status: UploadStatus;
  /** Upload progress (0-100) */
  progress: number;
  /** Error message if upload failed */
  error?: string;
  /** Public URL after successful upload */
  url?: string;
  /** Storage key/path */
  key?: string;
  /** File MIME type */
  contentType: string;
  /** The original File object */
  file: File;
};

/**
 * Response from the presigned URL endpoint
 */
export type PresignedUrlResponse = {
  /** The presigned URL for uploading */
  url: string;
  /** HTTP method to use */
  method: "PUT" | "POST";
  /** Headers to include in the upload request */
  headers: Record<string, string>;
  /** Storage key/path */
  key: string;
  /** Public URL where file will be accessible */
  publicUrl: string;
};

/**
 * Options for the BucketKitProvider
 */
export type BucketKitProviderOptions = {
  /**
   * API endpoint that returns presigned URLs
   * @example '/api/upload'
   */
  endpoint: string;
  /**
   * Additional headers to send with presigned URL requests (e.g., auth tokens)
   */
  headers?: Record<string, string>;
  /**
   * Callback when an upload completes successfully
   */
  onUploadComplete?: (item: UploadItem) => void;
  /**
   * Callback when an upload fails
   */
  onError?: (error: Error, item: UploadItem) => void;
  /**
   * Whether to automatically start uploading when files are added
   * @default true
   */
  autoUpload?: boolean;
  /**
   * Maximum number of concurrent uploads
   * @default 3
   */
  maxConcurrent?: number;
};

/**
 * Context value for BucketKit
 */
export type BucketKitContextValue = {
  /** Current upload items */
  items: UploadItem[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Overall progress across all uploads (0-100) */
  progress: number;
  /** Add files to the upload queue */
  addFiles: (files: File[]) => void;
  /** Start uploading queued files */
  uploadFiles: (files?: File[]) => Promise<void>;
  /** Cancel a specific upload */
  cancelUpload: (id: string) => void;
  /** Remove an item from the list */
  removeItem: (id: string) => void;
  /** Retry a failed upload */
  retryUpload: (id: string) => void;
  /** Clear all completed/errored items */
  clearCompleted: () => void;
  /** Provider options */
  options: BucketKitProviderOptions;
};

/**
 * Props for dropzone component
 */
export type BucketKitDropzoneProps = {
  /** Whether to accept multiple files */
  multiple?: boolean;
  /** Accepted file types (MIME types or extensions) */
  accept?: string | string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Disable the dropzone */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom content when idle */
  children?: React.ReactNode;
  /** Custom content when dragging over */
  dragActiveContent?: React.ReactNode;
  /** Callback when files are selected/dropped */
  onFilesSelected?: (files: File[]) => void;
};

/**
 * Props for upload button component
 */
export type BucketKitUploadButtonProps = {
  /** Whether to accept multiple files */
  multiple?: boolean;
  /** Accepted file types */
  accept?: string | string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Disable the button */
  disabled?: boolean;
  /** Button variant (matches shadcn) */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional CSS class names */
  className?: string;
  /** Button content */
  children?: React.ReactNode;
};

/**
 * Props for upload list component
 */
export type BucketKitUploadListProps = {
  /** Whether to show cancel buttons */
  showCancel?: boolean;
  /** Whether to show retry buttons for failed uploads */
  showRetry?: boolean;
  /** Whether to show remove buttons */
  showRemove?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom class names for internal elements */
  slotClassNames?: {
    item?: string;
    fileName?: string;
    progress?: string;
    status?: string;
    actions?: string;
  };
  /** Custom render function for items */
  renderItem?: (
    item: UploadItem,
    actions: UploadItemActions
  ) => React.ReactNode;
};

/**
 * Actions available for upload items
 */
export type UploadItemActions = {
  cancel: () => void;
  remove: () => void;
  retry: () => void;
};
