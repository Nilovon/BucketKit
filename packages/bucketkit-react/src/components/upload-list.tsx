import { useBucketKit } from "../context.js";
import { useUploadItemActions } from "../hooks.js";
import type { BucketKitUploadListProps, UploadItem } from "../types.js";
import { cn, formatBytes } from "../utils.js";

/**
 * Progress bar component
 */
function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: UploadItem["status"] }) {
  const styles = {
    queued: "bg-muted text-muted-foreground",
    uploading: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    complete:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const labels = {
    queued: "Queued",
    uploading: "Uploading",
    complete: "Complete",
    error: "Error",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

/**
 * File icon component
 */
function FileIcon({ contentType }: { contentType: string }) {
  const isImage = contentType.startsWith("image/");
  const isVideo = contentType.startsWith("video/");
  const isPdf = contentType === "application/pdf";

  if (isImage) {
    return (
      <svg
        className="h-8 w-8 text-purple-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      </svg>
    );
  }

  if (isVideo) {
    return (
      <svg
        className="h-8 w-8 text-pink-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      </svg>
    );
  }

  if (isPdf) {
    return (
      <svg
        className="h-8 w-8 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-8 w-8 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/**
 * Single upload item row
 */
function UploadItemRow({
  item,
  showCancel,
  showRetry,
  showRemove,
  slotClassNames,
}: {
  item: UploadItem;
  showCancel?: boolean;
  showRetry?: boolean;
  showRemove?: boolean;
  slotClassNames?: BucketKitUploadListProps["slotClassNames"];
}) {
  const actions = useUploadItemActions(item.id);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors",
        item.status === "error" && "border-red-200 dark:border-red-800",
        slotClassNames?.item
      )}
    >
      {/* File icon */}
      <div className="flex-shrink-0">
        <FileIcon contentType={item.contentType} />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate font-medium text-sm",
              slotClassNames?.fileName
            )}
            title={item.fileName}
          >
            {item.fileName}
          </p>
          <StatusBadge status={item.status} />
        </div>

        <p className="text-muted-foreground text-xs">
          {formatBytes(item.size)}
        </p>

        {/* Progress bar for uploading items */}
        {item.status === "uploading" && (
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar
              className={slotClassNames?.progress}
              value={item.progress}
            />
            <span className="text-muted-foreground text-xs">
              {item.progress}%
            </span>
          </div>
        )}

        {/* Error message */}
        {item.status === "error" && item.error && (
          <p className="mt-1 text-red-600 text-xs dark:text-red-400">
            {item.error}
          </p>
        )}

        {/* Success URL */}
        {item.status === "complete" && item.url && (
          <a
            className="mt-1 block truncate text-blue-600 text-xs hover:underline dark:text-blue-400"
            href={item.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {item.url}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className={cn("flex items-center gap-1", slotClassNames?.actions)}>
        {showCancel && item.status === "uploading" && (
          <button
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={actions.cancel}
            title="Cancel upload"
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        )}

        {showRetry && item.status === "error" && (
          <button
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={actions.retry}
            title="Retry upload"
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        )}

        {showRemove &&
          (item.status === "complete" ||
            item.status === "error" ||
            item.status === "queued") && (
            <button
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={actions.remove}
              title="Remove"
              type="button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}
      </div>
    </div>
  );
}

/**
 * List component for displaying upload progress
 *
 * @example
 * ```tsx
 * <BucketKitUploadList
 *   showCancel
 *   showRetry
 *   showRemove
 * />
 * ```
 */
export function BucketKitUploadList({
  showCancel = true,
  showRetry = true,
  showRemove = true,
  className,
  slotClassNames,
  renderItem,
}: BucketKitUploadListProps) {
  const { items, clearCompleted } = useBucketKit();
  const hasCompleted = items.some(
    (item) => item.status === "complete" || item.status === "error"
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with clear button */}
      {hasCompleted && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {items.length} file{items.length !== 1 ? "s" : ""}
          </span>
          <button
            className="text-muted-foreground text-xs hover:text-foreground"
            onClick={clearCompleted}
            type="button"
          >
            Clear completed
          </button>
        </div>
      )}

      {/* Upload items */}
      <div className="space-y-2">
        {items.map((item) =>
          renderItem ? (
            <div key={item.id}>
              {renderItem(item, {
                cancel: () => {
                  // Placeholder for custom render
                },
                remove: () => {
                  // Placeholder for custom render
                },
                retry: () => {
                  // Placeholder for custom render
                },
              })}
            </div>
          ) : (
            <UploadItemRow
              item={item}
              key={item.id}
              showCancel={showCancel}
              showRemove={showRemove}
              showRetry={showRetry}
              slotClassNames={slotClassNames}
            />
          )
        )}
      </div>
    </div>
  );
}
