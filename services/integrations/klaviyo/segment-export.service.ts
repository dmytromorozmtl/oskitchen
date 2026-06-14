import type {
  KlaviyoSegmentExportResult,
  KlaviyoSegmentRow,
} from "@/lib/integrations/klaviyo-live-types";
import {
  fetchKlaviyoSegmentProfileEmails,
  fetchKlaviyoSegments,
  verifyKlaviyoApiKey,
} from "@/services/integrations/klaviyo/klaviyo-api";
import { getKlaviyoApiKey } from "@/services/integrations/klaviyo/klaviyo-credentials";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function listKlaviyoSegmentsForExport(): Promise<
  { ok: true; segments: KlaviyoSegmentRow[] } | { ok: false; error: string }
> {
  const apiKey = getKlaviyoApiKey();
  if (!apiKey) return { ok: false, error: "Set KLAVIYO_API_KEY" };

  const verified = await verifyKlaviyoApiKey(apiKey);
  if (!verified.ok) return { ok: false, error: verified.error };

  const segments = await fetchKlaviyoSegments(apiKey);
  return { ok: true, segments };
}

export async function exportKlaviyoSegmentProfiles(
  segmentId: string,
  opts?: { limit?: number },
): Promise<KlaviyoSegmentExportResult> {
  const apiKey = getKlaviyoApiKey();
  if (!apiKey) {
    return {
      ok: false,
      rowCount: 0,
      filename: "",
      csv: "",
      message: "Set KLAVIYO_API_KEY",
    };
  }

  const verified = await verifyKlaviyoApiKey(apiKey);
  if (!verified.ok) {
    return {
      ok: false,
      rowCount: 0,
      filename: "",
      csv: "",
      message: verified.error,
    };
  }

  const emails = await fetchKlaviyoSegmentProfileEmails(apiKey, segmentId, opts?.limit ?? 2000);
  const header = "email";
  const lines = [header, ...emails.map(csvEscape)];
  const csv = lines.join("\n");
  const filename = `klaviyo-segment-${segmentId.slice(0, 8)}.csv`;

  return {
    ok: true,
    rowCount: emails.length,
    filename,
    csv,
    message: `Exported ${emails.length} profiles from segment`,
  };
}
