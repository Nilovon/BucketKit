import {
  BucketKitDropzone,
  BucketKitProvider,
  BucketKitUploadButton,
  BucketKitUploadList,
  type UploadItem,
  useBucketKitUpload,
  useUploadStats,
} from "@nilovonjs/bucketkit-react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  return (
    <BucketKitProvider
      endpoint="/api/upload"
      maxConcurrent={3}
      onError={(error: Error, item: UploadItem) => {
        toast.error(`Failed to upload: ${item.fileName}`, {
          description: error.message,
        });
      }}
      onUploadComplete={(item: UploadItem) => {
        toast.success(`Uploaded: ${item.fileName}`, {
          description: item.url,
        });
      }}
    >
      <UploadDemo />
    </BucketKitProvider>
  );
}

function UploadDemo() {
  const { isUploading } = useBucketKitUpload();
  const stats = useUploadStats();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">
          BucketKit Upload Demo
        </h1>
        <p className="text-muted-foreground">
          Drag and drop files or click to upload. Supports images and PDFs up to
          10MB.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Dropzone Section */}
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold text-lg">Drop Zone</h2>
          <BucketKitDropzone
            accept={["image/*", "application/pdf"]}
            className="min-h-[200px]"
            maxSize={10 * 1024 * 1024}
            multiple
          />
        </section>

        {/* Button Section */}
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold text-lg">Upload Button</h2>
          <div className="flex flex-wrap gap-3">
            <BucketKitUploadButton
              accept={["image/*", "application/pdf"]}
              maxSize={10 * 1024 * 1024}
              multiple
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Files
            </BucketKitUploadButton>

            <BucketKitUploadButton
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              variant="outline"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Images Only
            </BucketKitUploadButton>

            <BucketKitUploadButton accept="application/pdf" variant="secondary">
              <FileIcon className="mr-2 h-4 w-4" />
              PDF Only
            </BucketKitUploadButton>
          </div>
        </section>

        {/* Stats Section */}
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold text-lg">Upload Stats</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Queued" value={stats.queued} />
            <StatCard
              highlight={isUploading}
              label="Uploading"
              value={stats.uploading}
            />
            <StatCard color="green" label="Complete" value={stats.complete} />
          </div>
        </section>

        {/* Upload List */}
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold text-lg">Upload Progress</h2>
          <BucketKitUploadList showCancel showRemove showRetry />
          {stats.total === 0 && (
            <p className="text-center text-muted-foreground text-sm">
              No uploads yet. Drop files above or use the upload buttons.
            </p>
          )}
        </section>

        {/* API Info */}
        <section className="rounded-xl border border-amber-500/50 border-dashed bg-amber-500/5 p-6">
          <h2 className="mb-2 font-semibold text-amber-600 text-lg dark:text-amber-400">
            ⚠️ Demo Mode
          </h2>
          <p className="text-muted-foreground text-sm">
            This demo requires a backend API endpoint at{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              /api/upload
            </code>{" "}
            that returns presigned S3 URLs. Without it, uploads will fail with a
            404 error.
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            See the documentation for how to set up the backend.
          </p>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color?: "green";
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-center transition-colors ${
        highlight ? "border-primary bg-primary/5" : ""
      } ${color === "green" ? "border-green-500/30 bg-green-500/5" : ""}`}
    >
      <p className="font-bold text-2xl">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
