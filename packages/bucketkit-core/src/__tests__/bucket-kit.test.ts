import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBucketKit } from "../bucket-kit.js";
import { BucketKitError } from "../errors.js";
import type { BucketKitConfig } from "../types.js";

// Mock AWS SDK
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  PutObjectCommand: vi.fn().mockImplementation((params) => params),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi
    .fn()
    .mockResolvedValue("https://s3.example.com/presigned-url"),
}));

const validConfig: BucketKitConfig = {
  provider: "aws-s3",
  region: "us-east-1",
  bucket: "test-bucket",
  credentials: {
    accessKeyId: "test-access-key",
    secretAccessKey: "test-secret-key",
  },
  defaultUploadPolicy: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/*", "application/pdf"],
  },
};

describe("createBucketKit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("configuration", () => {
    it("should create a BucketKit instance with valid config", () => {
      const bucketKit = createBucketKit(validConfig);

      expect(bucketKit).toBeDefined();
      expect(bucketKit.createPresignedUpload).toBeTypeOf("function");
      expect(bucketKit.validateUploadRequest).toBeTypeOf("function");
      expect(bucketKit.getPublicUrl).toBeTypeOf("function");
    });

    it("should throw error when region is missing", () => {
      expect(() =>
        createBucketKit({
          ...validConfig,
          region: "",
        })
      ).toThrow(BucketKitError);
    });

    it("should throw error when bucket is missing", () => {
      expect(() =>
        createBucketKit({
          ...validConfig,
          bucket: "",
        })
      ).toThrow(BucketKitError);
    });

    it("should expose readonly config", () => {
      const bucketKit = createBucketKit(validConfig);

      expect(bucketKit.config.region).toBe("us-east-1");
      expect(bucketKit.config.bucket).toBe("test-bucket");
    });
  });

  describe("validateUploadRequest", () => {
    it("should return valid for files within policy", () => {
      const bucketKit = createBucketKit(validConfig);

      const result = bucketKit.validateUploadRequest({
        fileName: "test.jpg",
        contentType: "image/jpeg",
        size: 1024,
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject files exceeding maxSize", () => {
      const bucketKit = createBucketKit(validConfig);

      const result = bucketKit.validateUploadRequest({
        fileName: "large-file.jpg",
        contentType: "image/jpeg",
        size: 20 * 1024 * 1024, // 20 MB
      });

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe("FILE_TOO_LARGE");
    });

    it("should reject files with invalid MIME type", () => {
      const bucketKit = createBucketKit(validConfig);

      const result = bucketKit.validateUploadRequest({
        fileName: "script.js",
        contentType: "application/javascript",
        size: 1024,
      });

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe("INVALID_MIME_TYPE");
    });

    it("should accept wildcard MIME types", () => {
      const bucketKit = createBucketKit(validConfig);

      const result = bucketKit.validateUploadRequest({
        fileName: "test.png",
        contentType: "image/png",
        size: 1024,
      });

      expect(result.valid).toBe(true);
    });

    it("should reject empty filename", () => {
      const bucketKit = createBucketKit(validConfig);

      const result = bucketKit.validateUploadRequest({
        fileName: "",
        contentType: "image/jpeg",
        size: 1024,
      });

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe("INVALID_FILE_NAME");
    });

    it("should allow policy overrides", () => {
      const bucketKit = createBucketKit(validConfig);

      const result = bucketKit.validateUploadRequest({
        fileName: "script.js",
        contentType: "application/javascript",
        size: 1024,
        policyOverrides: {
          allowedMimeTypes: ["application/javascript"],
        },
      });

      expect(result.valid).toBe(true);
    });
  });

  describe("createPresignedUpload", () => {
    it("should create a presigned upload URL", async () => {
      const bucketKit = createBucketKit(validConfig);

      const result = await bucketKit.createPresignedUpload({
        fileName: "test.jpg",
        contentType: "image/jpeg",
        size: 1024,
      });

      expect(result.url).toBe("https://s3.example.com/presigned-url");
      expect(result.method).toBe("PUT");
      expect(result.headers).toHaveProperty("Content-Type", "image/jpeg");
      expect(result.key).toContain("test.jpg");
      expect(result.expiresIn).toBeGreaterThan(0);
      expect(result.publicUrl).toBeDefined();
    });

    it("should throw error for invalid files", async () => {
      const bucketKit = createBucketKit(validConfig);

      await expect(
        bucketKit.createPresignedUpload({
          fileName: "large-file.jpg",
          contentType: "image/jpeg",
          size: 20 * 1024 * 1024,
        })
      ).rejects.toThrow(BucketKitError);
    });

    it("should include userId in path when provided", async () => {
      const bucketKit = createBucketKit(validConfig);

      const result = await bucketKit.createPresignedUpload({
        fileName: "test.jpg",
        contentType: "image/jpeg",
        size: 1024,
        userId: "user123",
      });

      expect(result.key).toContain("user123");
    });

    it("should use custom pathResolver when provided", async () => {
      const customResolver = vi.fn().mockReturnValue("custom/path/file.jpg");
      const bucketKit = createBucketKit({
        ...validConfig,
        defaultUploadPolicy: {
          ...validConfig.defaultUploadPolicy!,
          pathResolver: customResolver,
        },
      });

      const result = await bucketKit.createPresignedUpload({
        fileName: "test.jpg",
        contentType: "image/jpeg",
        size: 1024,
      });

      expect(customResolver).toHaveBeenCalled();
      expect(result.key).toBe("custom/path/file.jpg");
    });
  });

  describe("getPublicUrl", () => {
    it("should return default S3 URL format", () => {
      const bucketKit = createBucketKit(validConfig);

      const url = bucketKit.getPublicUrl("uploads/test.jpg");

      expect(url).toBe(
        "https://test-bucket.s3.us-east-1.amazonaws.com/uploads/test.jpg"
      );
    });

    it("should use custom publicUrlBase when provided", () => {
      const bucketKit = createBucketKit({
        ...validConfig,
        publicUrlBase: "https://cdn.example.com",
      });

      const url = bucketKit.getPublicUrl("uploads/test.jpg");

      expect(url).toBe("https://cdn.example.com/uploads/test.jpg");
    });

    it("should handle publicUrlBase with trailing slash", () => {
      const bucketKit = createBucketKit({
        ...validConfig,
        publicUrlBase: "https://cdn.example.com/",
      });

      const url = bucketKit.getPublicUrl("uploads/test.jpg");

      expect(url).toBe("https://cdn.example.com/uploads/test.jpg");
    });
  });
});
