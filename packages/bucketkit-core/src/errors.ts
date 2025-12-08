/**
 * Error codes for BucketKit errors
 */
export type BucketKitErrorCode =
  | "INVALID_MIME_TYPE"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_NAME"
  | "MISSING_CREDENTIALS"
  | "MISSING_CONFIG"
  | "S3_ERROR"
  | "INTERNAL_ERROR";

/**
 * Custom error class for BucketKit operations
 *
 * @example
 * ```typescript
 * try {
 *   await bucketKit.createPresignedUpload({ ... });
 * } catch (error) {
 *   if (error instanceof BucketKitError) {
 *     console.log(error.code); // 'FILE_TOO_LARGE'
 *     console.log(error.message); // 'File size exceeds maximum allowed size'
 *   }
 * }
 * ```
 */
export class BucketKitError extends Error {
  /**
   * Error code for programmatic handling
   */
  readonly code: BucketKitErrorCode;

  /**
   * Optional metadata with additional error context
   */
  readonly meta?: Record<string, unknown>;

  constructor(
    code: BucketKitErrorCode,
    message: string,
    meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BucketKitError";
    this.code = code;
    this.meta = meta;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, BucketKitError.prototype);
  }

  /**
   * Convert error to a plain object for serialization
   */
  toJSON(): {
    name: string;
    code: BucketKitErrorCode;
    message: string;
    meta?: Record<string, unknown>;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      meta: this.meta,
    };
  }
}

/**
 * Type guard to check if an error is a BucketKitError
 */
export function isBucketKitError(error: unknown): error is BucketKitError {
  return error instanceof BucketKitError;
}
