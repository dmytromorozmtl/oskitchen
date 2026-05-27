import { beforeEach, describe, expect, it, vi } from "vitest";

const runUploadMalwareScan = vi.hoisted(() => vi.fn());
const logUploadDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/upload-policy/malware-scan", () => ({
  runUploadMalwareScan,
}));

vi.mock("@/services/audit/upload-audit", () => ({
  logUploadDenied,
}));

import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";

describe("enforceUploadContentSafety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logUploadDenied.mockResolvedValue(undefined);
  });

  it("returns scan receipt when malware scan passes", async () => {
    runUploadMalwareScan.mockResolvedValue({
      ok: true,
      receipt: { enabled: true, layer: "static", verdict: "clean" },
    });

    const result = await enforceUploadContentSafety({
      bytes: new Uint8Array([1, 2, 3]),
      mimeType: "image/jpeg",
      channel: "kitchen_product_image",
      actorUserId: "user-1",
    });

    expect(result).toEqual({
      ok: true,
      scan: { enabled: true, layer: "static", verdict: "clean" },
    });
    expect(logUploadDenied).not.toHaveBeenCalled();
  });

  it("denies and audits when malware scan blocks", async () => {
    runUploadMalwareScan.mockResolvedValue({
      ok: false,
      error: "This file was blocked by upload security checks.",
      threat: "windows_executable",
      layer: "static",
    });

    const result = await enforceUploadContentSafety({
      bytes: new Uint8Array([0x4d, 0x5a]),
      mimeType: "image/jpeg",
      channel: "kitchen_product_image",
      actorUserId: "user-1",
      workspaceId: "ws-1",
    });

    expect(result).toEqual({
      ok: false,
      error: "This file was blocked by upload security checks.",
    });
    expect(logUploadDenied).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "kitchen_product_image",
        reason: "This file was blocked by upload security checks.",
        metadata: expect.objectContaining({
          malwareThreat: "windows_executable",
          malwareScanLayer: "static",
        }),
      }),
    );
  });
});
