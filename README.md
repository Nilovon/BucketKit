# 📦 BucketKit

Modern, type-safe S3 upload library for Node.js and React.

## 🎯 Overview

BucketKit simplifies file uploads to S3 (and S3-compatible storage like MinIO, Cloudflare R2). It provides:

- 🔧 **Backend utilities** for generating presigned URLs and validating uploads
- ⚛️ **React components** for building beautiful upload interfaces
- 📝 **Full TypeScript support** with strict types

## 📚 Packages

| Package | Description |
|---------|-------------|
| `@nilovon/bucketkit-core` | Backend utilities for presigned URLs, validation, policies |
| `@nilovon/bucketkit-react` | React components and hooks for upload UIs |

## 🚀 Quick Start

### Installation

```bash
pnpm add @nilovon/bucketkit-core @nilovon/bucketkit-react
```

### Backend

```typescript
import { createBucketKit } from '@nilovon/bucketkit-core';

const bucketKit = createBucketKit({
  provider: 'aws-s3',
  region: 'us-east-1',
  bucket: 'my-uploads',
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/*', 'application/pdf'],
  },
});

// In your API route
const result = await bucketKit.createPresignedUpload({
  fileName: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 1024000,
});
```

### Frontend

```tsx
import { BucketKitProvider, BucketKitDropzone } from '@nilovon/bucketkit-react';

function App() {
  return (
    <BucketKitProvider endpoint="/api/upload">
      <BucketKitDropzone />
    </BucketKitProvider>
  );
}
```

## 📁 Project Structure

```
BucketKit/
├── apps/
│   ├── web/          # Demo app (TanStack Start)
│   └── docs/         # Documentation (Fumadocs)
├── packages/
│   ├── bucketkit-core/    # @nilovon/bucketkit-core
│   └── bucketkit-react/   # @nilovon/bucketkit-react
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start all apps
pnpm dev

# Start specific app
pnpm dev:web     # Demo at http://localhost:3001
pnpm --filter docs dev  # Docs at http://localhost:4000

# Build all packages
pnpm build

# Run tests
pnpm --filter @nilovon/bucketkit-core test
```

## 🔐 Environment Variables

For the core package to work, set these environment variables:

```bash
BUCKETKIT_S3_REGION=us-east-1
BUCKETKIT_S3_BUCKET=my-bucket
BUCKETKIT_S3_ACCESS_KEY_ID=your-access-key
BUCKETKIT_S3_SECRET_ACCESS_KEY=your-secret-key
```

## 📖 Documentation

Visit the [documentation](http://localhost:4000) for detailed guides:

- 🏁 Getting Started
- ✅ Upload Policies
- 🎨 React Components
- 🗂️ Custom Path Resolvers
- 🔒 Authentication

## 📄 License

MIT
