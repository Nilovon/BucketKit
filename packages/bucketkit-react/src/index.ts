/**
 * @nilovon/bucketkit-react
 *
 * React components and hooks for S3 uploads - Built with shadcn/ui
 *
 * @packageDocumentation
 */

// Components
export {
  BucketKitDropzone,
  BucketKitUploadButton,
  BucketKitUploadList,
} from "./components/index.js";
// Context & Provider
export { BucketKitProvider, useBucketKit } from "./context.js";
// Hooks
export {
  useBucketKitUpload,
  useCompletedUploads,
  useUploadItemActions,
  useUploadStats,
} from "./hooks.js";

// Types
export type {
  BucketKitContextValue,
  BucketKitDropzoneProps,
  BucketKitProviderOptions,
  BucketKitUploadButtonProps,
  BucketKitUploadListProps,
  PresignedUrlResponse,
  UploadItem,
  UploadItemActions,
  UploadStatus,
} from "./types.js";

// Utilities (for advanced usage)
export { cn, filterFiles, formatBytes, generateUploadId } from "./utils.js";
