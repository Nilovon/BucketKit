import { cva } from "class-variance-authority";
import { useCallback, useRef } from "react";
import { useBucketKit } from "../context.js";
import type { BucketKitUploadButtonProps } from "../types.js";
import { cn, filterFiles, parseAccept } from "../utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button component for triggering file uploads
 *
 * @example
 * ```tsx
 * <BucketKitUploadButton
 *   multiple
 *   accept="image/*"
 *   variant="outline"
 * >
 *   <UploadIcon className="mr-2 h-4 w-4" />
 *   Upload Images
 * </BucketKitUploadButton>
 * ```
 */
export function BucketKitUploadButton({
  multiple = true,
  accept,
  maxSize,
  disabled = false,
  variant = "default",
  size = "default",
  className,
  children,
}: BucketKitUploadButtonProps) {
  const { addFiles, isUploading } = useBucketKit();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const { valid, rejected } = filterFiles(files, { accept, maxSize });

      if (rejected.length > 0) {
        console.warn("BucketKit: Some files were rejected:", rejected);
      }

      if (valid.length > 0) {
        addFiles(valid);
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [accept, maxSize, addFiles]
  );

  const defaultContent = (
    <>
      <svg
        className="h-4 w-4"
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
      Upload
    </>
  );

  return (
    <>
      <input
        accept={parseAccept(accept)}
        className="hidden"
        disabled={disabled || isUploading}
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isUploading}
        onClick={handleClick}
        type="button"
      >
        {children || defaultContent}
      </button>
    </>
  );
}
