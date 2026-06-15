import type { UploadAuditChannel } from "@/services/audit/upload-audit";
import { logUploadDenied } from "@/services/audit/upload-audit";

import {
  runUploadMalwareScan,
  type UploadMalwareScanReceipt,
} from "@/lib/upload-policy/malware-scan";

type EnforceUploadContentSafetyInput = {
  bytes: Uint8Array;
  mimeType: string;
  channel: UploadAuditChannel;
  actorUserId?: string | null;
  workspaceId?: string | null;
  entity?: { type: string; id?: string | null; label?: string | null };
  metadata?: Record<string, unknown>;
  source?: "USER" | "API" | "SYSTEM";
};

export async function enforceUploadContentSafety(
  input: EnforceUploadContentSafetyInput,
): Promise<
  | { ok: true; scan: UploadMalwareScanReceipt }
  | { ok: false; error: string }
> {
  const scanned = await runUploadMalwareScan({
    bytes: input.bytes,
    mimeType: input.mimeType,
  });

  if (!scanned.ok) {
    void logUploadDenied({
      channel: input.channel,
      actorUserId: input.actorUserId,
      workspaceId: input.workspaceId,
      entity: input.entity,
      mimeType: input.mimeType,
      sizeBytes: input.bytes.byteLength,
      reason: scanned.error,
      metadata: {
        ...input.metadata,
        malwareScanLayer: scanned.layer,
        malwareThreat: scanned.threat,
      },
      source: input.source,
    });
    return { ok: false, error: scanned.error };
  }

  return { ok: true, scan: scanned.receipt };
}
