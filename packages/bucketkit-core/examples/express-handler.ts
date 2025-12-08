/**
 * Example: Express.js Presigned URL Handler
 *
 * This example shows how to create an API endpoint that generates
 * presigned URLs for S3 uploads using BucketKit.
 *
 * Run with: npx ts-node examples/express-handler.ts
 */

import { createBucketKit, isBucketKitError } from "../src/index.js";

// Initialize BucketKit with configuration
const bucketKit = createBucketKit({
  provider: "aws-s3",
  region: process.env.BUCKETKIT_S3_REGION || "us-east-1",
  bucket: process.env.BUCKETKIT_S3_BUCKET || "my-uploads",
  // Credentials are automatically loaded from environment variables:
  // - BUCKETKIT_S3_ACCESS_KEY_ID
  // - BUCKETKIT_S3_SECRET_ACCESS_KEY
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/*", "application/pdf"],
  },
});

/**
 * Request body for the upload endpoint
 */
type UploadRequest = {
  fileName: string;
  contentType: string;
  size: number;
};

/**
 * Example Express route handler for generating presigned URLs
 *
 * Usage with Express:
 *
 * ```typescript
 * import express from 'express';
 * import { handleUploadRequest } from './express-handler';
 *
 * const app = express();
 * app.use(express.json());
 *
 * app.post('/api/upload', async (req, res) => {
 *   const result = await handleUploadRequest(req.body, req.user?.id);
 *   res.status(result.status).json(result.body);
 * });
 * ```
 */
export async function handleUploadRequest(
  body: UploadRequest,
  userId?: string
): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  try {
    const { fileName, contentType, size } = body;

    // Validate required fields
    if (!(fileName && contentType && size)) {
      return {
        status: 400,
        body: {
          error: "Missing required fields: fileName, contentType, size",
        },
      };
    }

    // Create presigned upload URL
    const result = await bucketKit.createPresignedUpload({
      fileName,
      contentType,
      size,
      userId, // Optional: associate upload with user
    });

    return {
      status: 200,
      body: {
        url: result.url,
        method: result.method,
        headers: result.headers,
        key: result.key,
        publicUrl: result.publicUrl,
        expiresIn: result.expiresIn,
      },
    };
  } catch (error) {
    // Handle BucketKit validation errors
    if (isBucketKitError(error)) {
      const statusCode = getStatusCodeForError(error.code);
      return {
        status: statusCode,
        body: {
          error: error.message,
          code: error.code,
        },
      };
    }

    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return {
      status: 500,
      body: {
        error: "Internal server error",
      },
    };
  }
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: string): number {
  switch (code) {
    case "FILE_TOO_LARGE":
    case "INVALID_MIME_TYPE":
    case "INVALID_FILE_NAME":
      return 400;
    case "MISSING_CREDENTIALS":
    case "MISSING_CONFIG":
      return 500;
    case "S3_ERROR":
      return 502;
    default:
      return 500;
  }
}

// Example usage demonstration
async function _main() {
  console.log("BucketKit Express Handler Example\n");

  // Simulate a request
  const mockRequest: UploadRequest = {
    fileName: "photo.jpg",
    contentType: "image/jpeg",
    size: 1024 * 1024, // 1 MB
  };

  console.log("Request:", mockRequest);

  try {
    const result = await handleUploadRequest(mockRequest, "user-123");
    console.log("\nResponse:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run if executed directly
// main();
