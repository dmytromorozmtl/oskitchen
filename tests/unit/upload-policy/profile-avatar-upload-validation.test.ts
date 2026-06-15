import { describe, expect, it } from "vitest";

import {
  PROFILE_AVATAR_MAX_BYTES,
  validateProfileAvatarUpload,
} from "@/lib/upload-policy/media-upload-validation";

describe("validateProfileAvatarUpload", () => {
  it("rejects GIF avatars", () => {
    const bytes = new Uint8Array([0x47, 0x49, 0x46]);
    const result = validateProfileAvatarUpload({ bytes, mimeType: "image/gif" });
    expect(result.ok).toBe(false);
  });

  it("rejects oversize avatars", () => {
    const bytes = new Uint8Array(PROFILE_AVATAR_MAX_BYTES + 1);
    const result = validateProfileAvatarUpload({ bytes, mimeType: "image/jpeg" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("2MB");
    }
  });

  it("accepts small webp avatars", () => {
    const bytes = new Uint8Array(32);
    const result = validateProfileAvatarUpload({ bytes, mimeType: "image/webp" });
    expect(result.ok).toBe(true);
  });
});
