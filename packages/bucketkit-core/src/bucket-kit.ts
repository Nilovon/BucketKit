import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BucketKitError } from "./errors.js";
import type {
  BucketKit,
  BucketKitConfig,
  CreatePresignedUploadParams,
  PresignedUploadResult,
  S3Credentials,
  UploadPolicy,
  ValidateUploadParams,
  ValidationResult,
} from "./types.js";
import {
  defaultPathResolver,
  formatBytes,
  isMimeTypeAllowed,
} from "./utils.js";

/** Default expiration time for presigned URLs (15 minutes) */
const DEFAULT_EXPIRES_IN = 900;

/** Default maximum file size (10 MB) */
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/**
 * Resolve credentials from config or environment variables
 */
function resolveCredentials(configCredentials?: S3Credentials): S3Credentials {
  if (configCredentials) {
    return configCredentials;
  }

  const accessKeyId = process.env.BUCKETKIT_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BUCKETKIT_S3_SECRET_ACCESS_KEY;

  if (!(accessKeyId && secretAccessKey)) {
    throw new BucketKitError(
      "MISSING_CREDENTIALS",
      "S3 credentials not provided. Either pass credentials in config or set BUCKETKIT_S3_ACCESS_KEY_ID and BUCKETKIT_S3_SECRET_ACCESS_KEY environment variables."
    );
  }

  return { accessKeyId, secretAccessKey };
}

/**
 * Resolve configuration from config object or environment variables
 */
function resolveConfig(config: BucketKitConfig): BucketKitConfig {
  const region = config.region || process.env.BUCKETKIT_S3_REGION;
  const bucket = config.bucket || process.env.BUCKETKIT_S3_BUCKET;

  if (!region) {
    throw new BucketKitError(
      "MISSING_CONFIG",
      "S3 region not provided. Either pass region in config or set BUCKETKIT_S3_REGION environment variable."
    );
  }

  if (!bucket) {
    throw new BucketKitError(
      "MISSING_CONFIG",
      "S3 bucket not provided. Either pass bucket in config or set BUCKETKIT_S3_BUCKET environment variable."
    );
  }

  return {
    ...config,
    region,
    bucket,
  };
}

/**
 * Merge upload policy with defaults and overrides
 */
function mergePolicy(
  defaultPolicy?: UploadPolicy,
  overrides?: Partial<UploadPolicy>
): UploadPolicy {
  return {
    maxSize: overrides?.maxSize ?? defaultPolicy?.maxSize ?? DEFAULT_MAX_SIZE,
    allowedMimeTypes:
      overrides?.allowedMimeTypes ?? defaultPolicy?.allowedMimeTypes,
    pathResolver:
      overrides?.pathResolver ??
      defaultPolicy?.pathResolver ??
      defaultPathResolver,
  };
}

/**
 * Create a BucketKit instance for S3 upload operations
 *
 * @param config - Configuration options for BucketKit
 * @returns A BucketKit instance with methods for creating presigned URLs and validating uploads
 *
 * @example
 * ```typescript
 * import { createBucketKit } from '@nilovonjs/bucketkit-core';
 *
 * const bucketKit = createBucketKit({
 *   provider: 'aws-s3',
 *   region: 'us-east-1',
 *   bucket: 'my-uploads',
 *   defaultUploadPolicy: {
 *     maxSize: 10 * 1024 * 1024, // 10 MB
 *     allowedMimeTypes: ['image/*', 'application/pdf'],
 *   },
 * });
 *
 * // Create a presigned upload URL
 * const result = await bucketKit.createPresignedUpload({
 *   fileName: 'photo.jpg',
 *   contentType: 'image/jpeg',
 *   size: 1024 * 1024,
 * });
 *
 * console.log(result.url); // Presigned S3 URL
 * console.log(result.key); // Storage path
 * ```
 */
export function createBucketKit(config: BucketKitConfig): BucketKit {
  // Validate and resolve configuration
  const resolvedConfig = resolveConfig(config);
  const credentials = resolveCredentials(config.credentials);

  // Create S3 client
  const s3Client = new S3Client({
    region: resolvedConfig.region,
    credentials,
    endpoint: resolvedConfig.endpoint,
    forcePathStyle: resolvedConfig.forcePathStyle,
  });

  /**
   * Validate an upload request against the policy
   */
  function validateUploadRequest(
    params: ValidateUploadParams
  ): ValidationResult {
    const policy = mergePolicy(
      resolvedConfig.defaultUploadPolicy,
      params.policyOverrides
    );

    // Validate file size
    if (params.size > policy.maxSize) {
      return {
        valid: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: `File size (${formatBytes(params.size)}) exceeds maximum allowed size (${formatBytes(policy.maxSize)})`,
        },
      };
    }

    // Validate MIME type if restrictions are set
    if (
      policy.allowedMimeTypes &&
      policy.allowedMimeTypes.length > 0 &&
      !isMimeTypeAllowed(params.contentType, policy.allowedMimeTypes)
    ) {
      return {
        valid: false,
        error: {
          code: "INVALID_MIME_TYPE",
          message: `File type "${params.contentType}" is not allowed. Allowed types: ${policy.allowedMimeTypes.join(", ")}`,
        },
      };
    }

    // Validate filename
    if (!params.fileName || params.fileName.trim() === "") {
      return {
        valid: false,
        error: {
          code: "INVALID_FILE_NAME",
          message: "File name is required",
        },
      };
    }

    return { valid: true };
  }

  /**
   * Get public URL for a file
   */
  function getPublicUrl(key: string): string {
    if (resolvedConfig.publicUrlBase) {
      // biome-ignore lint/performance/useTopLevelRegex: this is a regex literal
      const base = resolvedConfig.publicUrlBase.replace(/\/$/, "");
      return `${base}/${key}`;
    }

    // Default S3 URL pattern
    if (resolvedConfig.endpoint) {
      // biome-ignore lint/performance/useTopLevelRegex: this is a regex literal
      const endpoint = resolvedConfig.endpoint.replace(/\/$/, "");
      if (resolvedConfig.forcePathStyle) {
        return `${endpoint}/${resolvedConfig.bucket}/${key}`;
      }
      return `${endpoint}/${key}`;
    }

    return `https://${resolvedConfig.bucket}.s3.${resolvedConfig.region}.amazonaws.com/${key}`;
  }

  /**
   * Create a presigned URL for uploading
   */
  async function createPresignedUpload(
    params: CreatePresignedUploadParams
  ): Promise<PresignedUploadResult> {
    // Validate the request first
    const validation = validateUploadRequest({
      fileName: params.fileName,
      contentType: params.contentType,
      size: params.size,
      policyOverrides: params.policyOverrides,
    });

    if (!validation.valid) {
      throw new BucketKitError(
        validation.error?.code as
          | "FILE_TOO_LARGE"
          | "INVALID_MIME_TYPE"
          | "INVALID_FILE_NAME",
        validation.error?.message ?? "",
        {
          fileName: params.fileName,
          contentType: params.contentType,
          size: params.size,
        }
      );
    }

    // Resolve the storage key
    const policy = mergePolicy(
      resolvedConfig.defaultUploadPolicy,
      params.policyOverrides
    );
    const pathResolver = policy.pathResolver ?? defaultPathResolver;
    const key = pathResolver({
      fileName: params.fileName,
      userId: params.userId,
      contentType: params.contentType,
      size: params.size,
    });

    try {
      // Create the presigned URL
      const command = new PutObjectCommand({
        Bucket: resolvedConfig.bucket,
        Key: key,
        ContentType: params.contentType,
        ContentLength: params.size,
      });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: DEFAULT_EXPIRES_IN,
      });

      return {
        url,
        method: "PUT",
        headers: {
          "Content-Type": params.contentType,
          "Content-Length": params.size.toString(),
        },
        key,
        expiresIn: DEFAULT_EXPIRES_IN,
        publicUrl: getPublicUrl(key),
      };
    } catch (error) {
      throw new BucketKitError(
        "S3_ERROR",
        `Failed to create presigned URL: ${error instanceof Error ? error.message : "Unknown error"}`,
        { originalError: error }
      );
    }
  }

  return {
    createPresignedUpload,
    validateUploadRequest,
    getPublicUrl,
    config: Object.freeze({ ...resolvedConfig }),
  };
}
