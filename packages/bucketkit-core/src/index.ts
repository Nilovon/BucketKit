/**
 * @nilovonjs/bucketkit-core
 *
 * S3 Upload Library for Node.js - Core utilities for presigned URLs,
 * validation, and upload policies.
 *
 * @packageDocumentation
 */

// Main factory function
export { createBucketKit } from "./bucket-kit.js";
export type { BucketKitErrorCode } from "./errors.js";
// Error handling
export { BucketKitError, isBucketKitError } from "./errors.js";

// Types
export type {
  BucketKit,
  BucketKitConfig,
  CreatePresignedUploadParams,
  PathResolverParams,
  PresignedUploadResult,
  S3Credentials,
  StorageProvider,
  UploadPolicy,
  ValidateUploadParams,
  ValidationResult,
} from "./types.js";

// Utility functions (exported for advanced use cases)
export {
  defaultPathResolver,
  formatBytes,
  generateUniqueId,
  getFileExtension,
  isMimeTypeAllowed,
  mimeTypeMatches,
  sanitizeFileName,
} from "./utils.js";
