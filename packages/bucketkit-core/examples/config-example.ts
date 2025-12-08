/**
 * Example: BucketKit Configuration Options
 *
 * This file demonstrates various configuration options for BucketKit.
 */

import type { BucketKitConfig, PathResolverParams } from "../src/index.js";
import { createBucketKit } from "../src/index.js";

/**
 * Basic Configuration
 *
 * Minimal setup with just the required options.
 * Credentials are loaded from environment variables.
 */
export const basicConfig: BucketKitConfig = {
  provider: "aws-s3",
  region: "us-east-1",
  bucket: "my-bucket",
};

/**
 * Configuration with Explicit Credentials
 *
 * Use this when you can't rely on environment variables.
 */
export const configWithCredentials: BucketKitConfig = {
  provider: "aws-s3",
  region: "eu-west-1",
  bucket: "my-eu-bucket",
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY",
    secretAccessKey: "YOUR_SECRET_KEY",
  },
};

/**
 * Configuration with Upload Policy
 *
 * Define size limits and allowed file types.
 */
export const configWithPolicy: BucketKitConfig = {
  provider: "aws-s3",
  region: "us-east-1",
  bucket: "my-uploads",
  defaultUploadPolicy: {
    maxSize: 50 * 1024 * 1024, // 50 MB
    allowedMimeTypes: [
      "image/*", // All image types
      "video/*", // All video types
      "application/pdf", // PDFs
      "application/zip", // ZIP archives
    ],
  },
};

/**
 * Custom Path Resolver
 *
 * Organize files in custom directory structures.
 */
function customPathResolver(params: PathResolverParams): string {
  const { fileName, userId, contentType } = params;
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Get file type category
  const category = contentType.startsWith("image/")
    ? "images"
    : contentType.startsWith("video/")
      ? "videos"
      : "documents";

  // Build path: /users/{userId}/{category}/{year}/{month}/{fileName}
  if (userId) {
    return `users/${userId}/${category}/${year}/${month}/${Date.now()}-${fileName}`;
  }

  return `public/${category}/${year}/${month}/${Date.now()}-${fileName}`;
}

export const configWithCustomPath: BucketKitConfig = {
  provider: "aws-s3",
  region: "us-east-1",
  bucket: "organized-uploads",
  defaultUploadPolicy: {
    maxSize: 100 * 1024 * 1024,
    allowedMimeTypes: ["image/*", "video/*", "application/pdf"],
    pathResolver: customPathResolver,
  },
};

/**
 * Configuration for S3-Compatible Services
 *
 * Use with MinIO, DigitalOcean Spaces, Cloudflare R2, etc.
 */
export const minioConfig: BucketKitConfig = {
  provider: "aws-s3",
  region: "us-east-1", // Usually ignored for MinIO
  bucket: "my-minio-bucket",
  endpoint: "http://localhost:9000", // MinIO endpoint
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
};

export const cloudflareR2Config: BucketKitConfig = {
  provider: "aws-s3",
  region: "auto",
  bucket: "my-r2-bucket",
  endpoint: "https://ACCOUNT_ID.r2.cloudflarestorage.com",
  publicUrlBase: "https://my-r2-bucket.ACCOUNT_ID.r2.dev",
};

/**
 * Configuration with CDN
 *
 * Use a custom domain or CDN for public URLs.
 */
export const configWithCDN: BucketKitConfig = {
  provider: "aws-s3",
  region: "us-east-1",
  bucket: "my-bucket",
  publicUrlBase: "https://cdn.mywebsite.com",
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/*"],
  },
};

/**
 * Example Usage
 */
async function _example() {
  // Create BucketKit instance
  const bucketKit = createBucketKit(configWithPolicy);

  // Generate presigned URL
  const result = await bucketKit.createPresignedUpload({
    fileName: "profile.jpg",
    contentType: "image/jpeg",
    size: 1024 * 1024,
    userId: "user-123",
  });

  console.log("Upload URL:", result.url);
  console.log("Public URL:", result.publicUrl);
  console.log("Storage Key:", result.key);
}

// Uncomment to run:
// example();
