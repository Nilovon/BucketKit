/**
 * Supported storage providers
 */
export type StorageProvider = "aws-s3";

/**
 * S3 credentials configuration
 */
export type S3Credentials = {
  /** AWS Access Key ID */
  accessKeyId: string;
  /** AWS Secret Access Key */
  secretAccessKey: string;
};

/**
 * Upload policy configuration for file validation
 */
export type UploadPolicy = {
  /** Maximum file size in bytes */
  maxSize: number;
  /** Allowed MIME types (e.g., ['image/*', 'application/pdf']) */
  allowedMimeTypes?: string[];
  /**
   * Custom path resolver for generating storage keys
   * @param params - Parameters for path resolution
   * @returns The storage path/key for the file
   */
  pathResolver?: (params: PathResolverParams) => string;
};

/**
 * Parameters for the path resolver function
 */
export type PathResolverParams = {
  /** Original filename */
  fileName: string;
  /** Optional user identifier */
  userId?: string;
  /** File content type */
  contentType: string;
  /** File size in bytes */
  size: number;
};

/**
 * Configuration for BucketKit
 */
export type BucketKitConfig = {
  /** Storage provider (currently only 'aws-s3' is supported) */
  provider: StorageProvider;
  /** AWS region (e.g., 'us-east-1') */
  region: string;
  /** S3 bucket name */
  bucket: string;
  /**
   * S3 credentials. If not provided, will attempt to use environment variables:
   * - BUCKETKIT_S3_ACCESS_KEY_ID
   * - BUCKETKIT_S3_SECRET_ACCESS_KEY
   */
  credentials?: S3Credentials;
  /** Default upload policy applied to all uploads unless overridden */
  defaultUploadPolicy?: UploadPolicy;
  /**
   * Custom S3 endpoint URL (for S3-compatible services like MinIO, R2)
   * @example 'https://s3.eu-central-1.amazonaws.com'
   */
  endpoint?: string;
  /** Force path-style URLs (required for some S3-compatible services) */
  forcePathStyle?: boolean;
  /**
   * Base URL for public file access (CDN or custom domain)
   * If not set, will use the default S3 URL pattern
   * @example 'https://cdn.example.com'
   */
  publicUrlBase?: string;
};

/**
 * Parameters for creating a presigned upload URL
 */
export type CreatePresignedUploadParams = {
  /** Original filename */
  fileName: string;
  /** File MIME type */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** Optional user identifier for path resolution */
  userId?: string;
  /** Override the default upload policy for this request */
  policyOverrides?: Partial<UploadPolicy>;
};

/**
 * Result of creating a presigned upload URL
 */
export type PresignedUploadResult = {
  /** The presigned URL for uploading the file */
  url: string;
  /** HTTP method to use for upload (PUT for presigned URL) */
  method: "PUT";
  /** Headers to include in the upload request */
  headers: Record<string, string>;
  /** The storage key/path where the file will be stored */
  key: string;
  /** Expiration time for the presigned URL in seconds */
  expiresIn: number;
  /** Public URL where the file will be accessible after upload */
  publicUrl: string;
};

/**
 * Parameters for validating an upload request
 */
export type ValidateUploadParams = {
  /** Original filename */
  fileName: string;
  /** File MIME type */
  contentType: string;
  /** File size in bytes */
  size: number;
  /** Override the default upload policy for validation */
  policyOverrides?: Partial<UploadPolicy>;
};

/**
 * Result of upload validation
 */
export type ValidationResult = {
  /** Whether the upload is valid */
  valid: boolean;
  /** Error details if validation failed */
  error?: {
    code: string;
    message: string;
  };
};

/**
 * The BucketKit instance returned by createBucketKit
 */
export type BucketKit = {
  /**
   * Create a presigned URL for uploading a file to S3
   * @param params - Upload parameters
   * @returns Presigned upload details
   * @throws {BucketKitError} If validation fails or S3 operation fails
   */
  createPresignedUpload: (
    params: CreatePresignedUploadParams
  ) => Promise<PresignedUploadResult>;

  /**
   * Validate an upload request against the configured policy
   * @param params - Validation parameters
   * @returns Validation result
   */
  validateUploadRequest: (params: ValidateUploadParams) => ValidationResult;

  /**
   * Get the public URL for a stored file
   * @param key - The storage key of the file
   * @returns The public URL
   */
  getPublicUrl: (key: string) => string;

  /**
   * Get the current configuration (readonly)
   */
  readonly config: Readonly<BucketKitConfig>;
};
