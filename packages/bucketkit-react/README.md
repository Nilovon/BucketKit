# ⚛️ @nilovonjs/bucketkit-react

React components and hooks for S3 uploads - Built with shadcn/ui patterns for beautiful upload interfaces.

## 🎯 Overview

`@nilovonjs/bucketkit-react` provides React components and hooks for building beautiful file upload interfaces with direct-to-S3 uploads. Built with shadcn/ui design patterns for easy customization.

## ✨ Features

- 🎨 **Beautiful UI** - Pre-built components with shadcn/ui styling
- 📤 **Drag & Drop** - Dropzone component for easy file selection
- 📊 **Progress Tracking** - Real-time upload progress with cancel support
- 🎣 **Hooks API** - Full control with custom UIs using hooks
- 🎨 **Customizable** - Easy styling with Tailwind CSS
- 📝 **Type-Safe** - Full TypeScript support
- ⚡ **Performant** - Direct-to-S3 uploads with progress tracking

## 🚀 Installation

```bash
npm install @nilovonjs/bucketkit-react
# or
pnpm add @nilovonjs/bucketkit-react
# or
yarn add @nilovonjs/bucketkit-react
```

**Peer Dependencies:**
- `react >= 18.0.0`
- `react-dom >= 18.0.0`

## 📖 Quick Start

### Basic Setup

```tsx
import {
  BucketKitProvider,
  BucketKitDropzone,
  BucketKitUploadList,
} from '@nilovonjs/bucketkit-react';

function App() {
  return (
    <BucketKitProvider endpoint="/api/upload">
      <BucketKitDropzone />
      <BucketKitUploadList />
    </BucketKitProvider>
  );
}
```

### With Custom Configuration

```tsx
import {
  BucketKitProvider,
  BucketKitDropzone,
  BucketKitUploadList,
} from '@nilovonjs/bucketkit-react';

function App() {
  return (
    <BucketKitProvider
      endpoint="/api/upload"
      onUploadComplete={(file) => {
        console.log('Uploaded:', file.url);
      }}
      onUploadError={(error) => {
        console.error('Upload failed:', error);
      }}
    >
      <BucketKitDropzone
        multiple
        accept={['image/*', 'application/pdf']}
        maxSize={10 * 1024 * 1024} // 10 MB
      />
      <BucketKitUploadList />
    </BucketKitProvider>
  );
}
```

## 🧩 Components

### `BucketKitProvider`

Context provider that manages upload state and configuration.

**Props:**
- `endpoint: string` - API endpoint for generating presigned URLs
- `onUploadComplete?: (file: UploadItem) => void` - Callback when upload completes
- `onUploadError?: (error: Error, file: UploadItem) => void` - Error callback
- `headers?: Record<string, string>` - Custom headers for API requests
- `children: ReactNode` - Child components

### `BucketKitDropzone`

Drag & drop file upload component.

```tsx
<BucketKitDropzone
  multiple
  accept={['image/*']}
  maxSize={10 * 1024 * 1024}
  className="border-2 border-dashed p-8"
/>
```

**Props:**
- `multiple?: boolean` - Allow multiple files
- `accept?: string[]` - Accepted MIME types
- `maxSize?: number` - Maximum file size in bytes
- `className?: string` - Custom CSS classes
- `disabled?: boolean` - Disable the dropzone

### `BucketKitUploadButton`

Button component for file selection.

```tsx
<BucketKitUploadButton
  accept={['image/*']}
  multiple
>
  Upload Files
</BucketKitUploadButton>
```

**Props:**
- `multiple?: boolean`
- `accept?: string[]`
- `maxSize?: number`
- `className?: string`
- `disabled?: boolean`
- `children: ReactNode` - Button content

### `BucketKitUploadList`

List component showing upload progress.

```tsx
<BucketKitUploadList
  showProgress
  showActions
  onRemove={(item) => console.log('Removed:', item)}
/>
```

**Props:**
- `showProgress?: boolean` - Show progress bars
- `showActions?: boolean` - Show cancel/remove buttons
- `onRemove?: (item: UploadItem) => void` - Remove callback
- `className?: string` - Custom CSS classes

## 🎣 Hooks

### `useBucketKitUpload()`

Main hook for managing file uploads.

```tsx
import { useBucketKitUpload } from '@nilovonjs/bucketkit-react';

function CustomUpload() {
  const {
    uploadFiles,
    items,
    isUploading,
    progress,
    cancelUpload,
    removeItem,
    retryUpload,
  } = useBucketKitUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} multiple />
      {isUploading && <p>Uploading: {progress}%</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.fileName}: {item.status} ({item.progress}%)
            {item.status === 'uploading' && (
              <button onClick={() => cancelUpload(item.id)}>Cancel</button>
            )}
            {item.status === 'error' && (
              <button onClick={() => retryUpload(item.id)}>Retry</button>
            )}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Returns:**
- `uploadFiles(files: File[])` - Start uploading files
- `addFiles(files: File[])` - Add files to queue without uploading
- `items: UploadItem[]` - List of upload items
- `isUploading: boolean` - Whether any upload is in progress
- `progress: number` - Overall progress (0-100)
- `cancelUpload(id: string)` - Cancel a specific upload
- `removeItem(id: string)` - Remove an item from the list
- `retryUpload(id: string)` - Retry a failed upload
- `clearCompleted()` - Clear all completed/errored items

### `useUploadItemActions(itemId: string)`

Get actions for a specific upload item.

```tsx
import { useUploadItemActions } from '@nilovonjs/bucketkit-react';

function UploadItemRow({ item }: { item: UploadItem }) {
  const actions = useUploadItemActions(item.id);

  return (
    <div>
      <span>{item.fileName}</span>
      {item.status === 'uploading' && (
        <button onClick={actions.cancel}>Cancel</button>
      )}
      {item.status === 'error' && (
        <button onClick={actions.retry}>Retry</button>
      )}
      <button onClick={actions.remove}>Remove</button>
    </div>
  );
}
```

**Returns:**
- `cancel: () => void` - Cancel the upload
- `retry: () => void` - Retry the upload
- `remove: () => void` - Remove the item

### `useUploadStats()`

Get aggregate upload statistics.

```tsx
import { useUploadStats } from '@nilovonjs/bucketkit-react';

function UploadStats() {
  const { total, completed, failed, uploading, progress } = useUploadStats();

  return (
    <div>
      <p>Total: {total}</p>
      <p>Completed: {completed}</p>
      <p>Failed: {failed}</p>
      <p>Uploading: {uploading}</p>
      <p>Progress: {progress}%</p>
    </div>
  );
}
```

### `useCompletedUploads()`

Get only completed uploads.

```tsx
import { useCompletedUploads } from '@nilovonjs/bucketkit-react';

function CompletedList() {
  const completed = useCompletedUploads();

  return (
    <ul>
      {completed.map((item) => (
        <li key={item.id}>
          <a href={item.url}>{item.fileName}</a>
        </li>
      ))}
    </ul>
  );
}
```

## 🎨 Styling

Components use Tailwind CSS and can be customized with the `className` prop. The package follows shadcn/ui patterns for easy styling.

### Custom Dropzone

```tsx
<BucketKitDropzone
  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors"
  disabledClassName="opacity-50 cursor-not-allowed"
/>
```

### Custom Upload List

```tsx
<BucketKitUploadList
  className="space-y-2"
  itemClassName="flex items-center justify-between p-4 bg-gray-100 rounded"
/>
```

## 📚 Types

### `UploadItem`

```typescript
type UploadItem = {
  id: string;
  file: File;
  fileName: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: Error;
};
```

### `PresignedUrlResponse`

Expected response from your API endpoint:

```typescript
type PresignedUrlResponse = {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  key: string;
  publicUrl: string;
  expiresIn: number;
};
```

## 🔗 Backend Integration

This package works with `@nilovonjs/bucketkit-core` on the backend. Your API endpoint should:

1. Accept a POST request with `{ fileName, contentType, size }`
2. Validate the request using `bucketKit.validateUploadRequest()`
3. Generate a presigned URL using `bucketKit.createPresignedUpload()`
4. Return the presigned URL response

See [`@nilovonjs/bucketkit-core`](../bucketkit-core) for backend setup.

## 📄 License

MIT
