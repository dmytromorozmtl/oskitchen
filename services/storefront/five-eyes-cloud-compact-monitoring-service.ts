import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFiveEyesCloudCompactEvidence,
  fiveEyesCloudCompactPdfLines,
  isFiveEyesCloudCompactEnabled,
} from "@/lib/compliance/five-eyes-cloud-compact";
import { uploadAuditCsvToS3WithLock } from "@/services/storefront/storefront-experiment-audit-archive-service";

function simplePdf(text: string): string {
  const safe = text.slice(0, 2000).replace(/[()\\]/g, " ");
  return [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj",
    `4 0 obj << /Length ${safe.length + 50} >> stream`,
    `BT /F1 9 Tf 40 750 Td (${safe}) Tj ET`,
    "endstream endobj",
    "xref",
    "0 5",
    "trailer << /Size 5 /Root 1 0 R >>",
    "startxref",
    "0",
    "%%EOF",
  ].join("\n");
}

export async function runFiveEyesCloudCompactMonitoringPack(): Promise<{
  ok: boolean;
  period: string;
  fiveEyesReady: boolean;
  aukusReady: boolean;
}> {
  if (!isFiveEyesCloudCompactEnabled()) {
    return { ok: true, period: "disabled", fiveEyesReady: false, aukusReady: false };
  }

  const ev = buildFiveEyesCloudCompactEvidence();
  const outDir = process.env.FIVE_EYES_CLOUD_OUT_DIR?.trim() || "/tmp/five-eyes-cloud";
  mkdirSync(outDir, { recursive: true });

  const jsonBody = JSON.stringify(ev, null, 2);
  writeFileSync(join(outDir, `monitoring-${ev.period}.json`), jsonBody, "utf-8");

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const jsonUploaded = await uploadAuditCsvToS3WithLock({
    key: `${prefix}/five-eyes-cloud-compact/${ev.period}/monitoring.json`,
    body: jsonBody,
    contentType: "application/json",
  });
  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/five-eyes-cloud-compact/${ev.period}/monitoring.pdf`,
    body: simplePdf(fiveEyesCloudCompactPdfLines(ev)),
    contentType: "application/pdf",
  });
  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/five-eyes-cloud-compact/${ev.period}/manifest.json`,
    body: JSON.stringify({
      period: ev.period,
      fiveEyesReady: ev.fiveEyesReady,
      aukusReady: ev.aukusReady,
      sha256: createHash("sha256").update(jsonBody).digest("hex"),
    }),
    contentType: "application/json",
  });

  return {
    ok: jsonUploaded,
    period: ev.period,
    fiveEyesReady: ev.fiveEyesReady,
    aukusReady: ev.aukusReady,
  };
}
