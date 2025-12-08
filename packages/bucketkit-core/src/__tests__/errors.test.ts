import { describe, expect, it } from "vitest";
import { BucketKitError, isBucketKitError } from "../errors.js";

describe("BucketKitError", () => {
  it("should create error with code and message", () => {
    const error = new BucketKitError("FILE_TOO_LARGE", "File is too large");

    expect(error.name).toBe("BucketKitError");
    expect(error.code).toBe("FILE_TOO_LARGE");
    expect(error.message).toBe("File is too large");
    expect(error.meta).toBeUndefined();
  });

  it("should include meta when provided", () => {
    const error = new BucketKitError("INVALID_MIME_TYPE", "Invalid type", {
      providedType: "text/plain",
    });

    expect(error.meta).toEqual({ providedType: "text/plain" });
  });

  it("should be instanceof Error", () => {
    const error = new BucketKitError("INTERNAL_ERROR", "Test");
    expect(error instanceof Error).toBe(true);
    expect(error instanceof BucketKitError).toBe(true);
  });

  it("should serialize to JSON correctly", () => {
    const error = new BucketKitError("FILE_TOO_LARGE", "File is too large", {
      maxSize: 1024,
    });

    const json = error.toJSON();

    expect(json).toEqual({
      name: "BucketKitError",
      code: "FILE_TOO_LARGE",
      message: "File is too large",
      meta: { maxSize: 1024 },
    });
  });
});

describe("isBucketKitError", () => {
  it("should return true for BucketKitError instances", () => {
    const error = new BucketKitError("INTERNAL_ERROR", "Test");
    expect(isBucketKitError(error)).toBe(true);
  });

  it("should return false for regular errors", () => {
    const error = new Error("Test");
    expect(isBucketKitError(error)).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(isBucketKitError(null)).toBe(false);
    expect(isBucketKitError(undefined)).toBe(false);
    expect(isBucketKitError("error")).toBe(false);
    expect(isBucketKitError({})).toBe(false);
  });
});
