# 📦 @nilovonjs/bucketkit-core

Backend utilities for S3 uploads - Generate presigned URLs, validate uploads, and manage storage policies.

## 🎯 Overview

`@nilovonjs/bucketkit-core` provides server-side utilities for handling S3 (and S3-compatible) file uploads. It generates secure presigned URLs, validates upload requests, and manages file storage paths.

## ✨ Features

- 🔐 **Presigned URLs** - Generate secure upload URLs for direct-to-S3 uploads
- ✅ **Validation** - Validate file size, MIME types, and custom rules
- 📁 **Path Resolution** - Organize files with custom path patterns
- 🛡️ **Error Handling** - Typed errors for easy handling
- 🔌 **S3 Compatible** - Works with AWS S3, MinIO, Cloudflare R2, and more
- 📝 **Full TypeScript** - Complete type safety with strict types

## 🚀 Installation

```bash
npm install @nilovonjs/bucketkit-core
# or
pnpm add @nilovonjs/bucketkit-core
# or
yarn add @nilovonjs/bucketkit-core
```

## 📖 Quick Start

### Basic Usage

```typescript
import { createBucketKit } from '@nilovonjs/bucketkit-core';

const bucketKit = createBucketKit({
  provider: 'aws-s3',
  region: 'us-east-1',
  bucket: 'my-uploads',
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ['image/*', 'application/pdf'],
  },
});

// Create a presigned upload URL
const result = await bucketKit.createPresignedUpload({
  fileName: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 1024 * 1024,
});

console.log(result.url); // Presigned S3 URL
console.log(result.key); // Storage path: "uploads/2024/01/photo.jpg"
console.log(result.publicUrl); // Public URL after upload
```

### Express.js API Route

```typescript
import express from 'express';
import { createBucketKit } from '@nilovonjs/bucketkit-core';
import { BucketKitError, isBucketKitError } from '@nilovonjs/bucketkit-core';

const app = express();
app.use(express.json());

const bucketKit = createBucketKit({
  provider: 'aws-s3',
  region: process.env.S3_REGION!,
  bucket: process.env.S3_BUCKET!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/*'],
  },
});

app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, contentType, size } = req.body;

    // Validate the upload request
    const validation = bucketKit.validateUploadRequest({
      fileName,
      contentType,
      size,
    });

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Create presigned URL
    const result = await bucketKit.createPresignedUpload({
      fileName,
      contentType,
      size,
    });

    res.json(result);
  } catch (error) {
    if (isBucketKitError(error)) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 🔧 Configuration

### Environment Variables

You can configure BucketKit using environment variables instead of passing them in code:

```bash
BUCKETKIT_S3_REGION=us-east-1
BUCKETKIT_S3_BUCKET=my-bucket
BUCKETKIT_S3_ACCESS_KEY_ID=your-access-key
BUCKETKIT_S3_SECRET_ACCESS_KEY=your-secret-key
```

```typescript
// Credentials and config will be read from environment
const bucketKit = createBucketKit({
  provider: 'aws-s3',
  // region and bucket can be omitted if set in env
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024,
  },
});
```

### Custom Path Resolver

Organize files with custom path patterns:

```typescript
const bucketKit = createBucketKit({
  provider: 'aws-s3',
  region: 'us-east-1',
  bucket: 'my-uploads',
  defaultUploadPolicy: {
    pathResolver: ({ fileName, userId, category }) => {
      // Custom path: "users/{userId}/{category}/{fileName}"
      return `users/${userId}/${category}/${fileName}`;
    },
  },
});
```

### S3-Compatible Storage

Works with MinIO, Cloudflare R2, and other S3-compatible services:

```typescript
// MinIO
const bucketKit = createBucketKit({
  provider: 'aws-s3',
  region: 'us-east-1',
  bucket: 'my-uploads',
  endpoint: 'https://minio.example.com',
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
});

// Cloudflare R2
const bucketKit = createBucketKit({
  provider: 'aws-s3',
  region: 'auto',
  bucket: 'my-uploads',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

## 📚 API Reference

### `createBucketKit(config: BucketKitConfig): BucketKit`

Creates a BucketKit instance with the provided configuration.

**Configuration Options:**

- `provider: 'aws-s3'` - Storage provider (currently only AWS S3)
- `region: string` - AWS region or S3-compatible region
- `bucket: string` - S3 bucket name
- `credentials?: S3Credentials` - Optional credentials (can use env vars)
- `endpoint?: string` - Custom endpoint for S3-compatible services
- `forcePathStyle?: boolean` - Use path-style URLs (required for MinIO)
- `defaultUploadPolicy?: UploadPolicy` - Default validation policy

### `bucketKit.createPresignedUpload(params): Promise<PresignedUploadResult>`

Generates a presigned URL for uploading a file.

**Parameters:**
- `fileName: string` - Original file name
- `contentType: string` - MIME type (e.g., 'image/jpeg')
- `size: number` - File size in bytes
- `policy?: Partial<UploadPolicy>` - Optional policy overrides

**Returns:**
```typescript
{
  url: string;           // Presigned upload URL
  method: 'PUT';         // HTTP method
  headers: Record<string, string>; // Required headers
  key: string;           // Storage key/path
  publicUrl: string;     // Public URL after upload
  expiresIn: number;     // Expiration in seconds
}
```

### `bucketKit.validateUploadRequest(params): ValidationResult`

Validates an upload request against the configured policy.

**Parameters:**
- `fileName: string`
- `contentType: string`
- `size: number`
- `policy?: Partial<UploadPolicy>` - Optional policy overrides

**Returns:**
```typescript
{
  valid: boolean;
  error?: string;
}
```

### `bucketKit.getPublicUrl(key: string): string`

Gets the public URL for a stored file.

## 🛡️ Error Handling

BucketKit provides typed errors for easy handling:

```typescript
import { BucketKitError, isBucketKitError } from '@nilovonjs/bucketkit-core';

try {
  const result = await bucketKit.createPresignedUpload({ ... });
} catch (error) {
  if (isBucketKitError(error)) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        console.error('Validation failed:', error.message);
        break;
      case 'MISSING_CREDENTIALS':
        console.error('S3 credentials not configured');
        break;
      default:
        console.error('Upload error:', error.message);
    }
  } else {
    // Handle other errors
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` - Upload validation failed
- `MISSING_CREDENTIALS` - S3 credentials not provided
- `MISSING_CONFIG` - Required configuration missing
- `S3_ERROR` - AWS S3 operation failed

## 🔗 Related Packages

- [`@nilovonjs/bucketkit-react`](../bucketkit-react) - React components and hooks for upload UIs

## 📄 License

MIT
