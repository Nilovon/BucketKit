import { describe, expect, it } from "vitest";
import {
  defaultPathResolver,
  formatBytes,
  getFileExtension,
  isMimeTypeAllowed,
  mimeTypeMatches,
  sanitizeFileName,
} from "../utils.js";

describe("sanitizeFileName", () => {
  it("should replace spaces with hyphens", () => {
    expect(sanitizeFileName("my file name.jpg")).toBe("my-file-name.jpg");
  });

  it("should remove special characters", () => {
    expect(sanitizeFileName("file@#$%^&*.jpg")).toBe("file.jpg");
  });

  it("should handle multiple consecutive hyphens", () => {
    expect(sanitizeFileName("file---name.jpg")).toBe("file-name.jpg");
  });

  it("should lowercase the extension", () => {
    expect(sanitizeFileName("file.JPG")).toBe("file.jpg");
  });

  it("should handle files without extension", () => {
    expect(sanitizeFileName("noextension")).toBe("noextension");
  });

  it("should return 'file' for empty input", () => {
    expect(sanitizeFileName("")).toBe("file");
  });

  it("should limit filename length", () => {
    const longName = `${"a".repeat(150)}.jpg`;
    const result = sanitizeFileName(longName);
    expect(result.length).toBeLessThanOrEqual(105); // 100 chars + extension
  });
});

describe("mimeTypeMatches", () => {
  it("should match exact MIME types", () => {
    expect(mimeTypeMatches("image/jpeg", "image/jpeg")).toBe(true);
    expect(mimeTypeMatches("image/jpeg", "image/png")).toBe(false);
  });

  it("should match wildcard patterns", () => {
    expect(mimeTypeMatches("image/jpeg", "image/*")).toBe(true);
    expect(mimeTypeMatches("image/png", "image/*")).toBe(true);
    expect(mimeTypeMatches("application/pdf", "image/*")).toBe(false);
  });

  it("should handle application/* wildcard", () => {
    expect(mimeTypeMatches("application/pdf", "application/*")).toBe(true);
    expect(mimeTypeMatches("application/json", "application/*")).toBe(true);
  });
});

describe("isMimeTypeAllowed", () => {
  it("should return true when MIME type matches any allowed type", () => {
    const allowed = ["image/*", "application/pdf"];
    expect(isMimeTypeAllowed("image/jpeg", allowed)).toBe(true);
    expect(isMimeTypeAllowed("application/pdf", allowed)).toBe(true);
  });

  it("should return false when MIME type does not match", () => {
    const allowed = ["image/*"];
    expect(isMimeTypeAllowed("application/pdf", allowed)).toBe(false);
  });

  it("should return false for empty allowed list", () => {
    expect(isMimeTypeAllowed("image/jpeg", [])).toBe(false);
  });
});

describe("formatBytes", () => {
  it("should format bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1_048_576)).toBe("1 MB");
    expect(formatBytes(1_073_741_824)).toBe("1 GB");
  });

  it("should handle decimal values", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(2_621_440)).toBe("2.5 MB");
  });
});

describe("getFileExtension", () => {
  it("should extract file extension", () => {
    expect(getFileExtension("file.jpg")).toBe("jpg");
    expect(getFileExtension("file.PDF")).toBe("pdf");
  });

  it("should return empty string for files without extension", () => {
    expect(getFileExtension("noextension")).toBe("");
  });

  it("should handle multiple dots", () => {
    expect(getFileExtension("file.name.jpg")).toBe("jpg");
  });

  it("should handle trailing dot", () => {
    expect(getFileExtension("file.")).toBe("");
  });
});

describe("defaultPathResolver", () => {
  it("should include userId when provided", () => {
    const path = defaultPathResolver({
      fileName: "test.jpg",
      userId: "user123",
      contentType: "image/jpeg",
      size: 1024,
    });

    expect(path).toContain("user123");
    expect(path).toContain("test.jpg");
    expect(path).toMatch(/^uploads\/user123\/.+-test\.jpg$/);
  });

  it("should work without userId", () => {
    const path = defaultPathResolver({
      fileName: "test.jpg",
      contentType: "image/jpeg",
      size: 1024,
    });

    expect(path).not.toContain("undefined");
    expect(path).toMatch(/^uploads\/.+-test\.jpg$/);
  });

  it("should generate unique paths for same file", () => {
    const params = {
      fileName: "test.jpg",
      contentType: "image/jpeg",
      size: 1024,
    };

    const path1 = defaultPathResolver(params);
    const path2 = defaultPathResolver(params);

    expect(path1).not.toBe(path2);
  });
});
