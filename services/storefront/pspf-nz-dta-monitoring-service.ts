import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPspfNzDtaEvidence,
  isPspfNzDtaEnabled,
  pspfNzDtaPdfLines,
} from "@/lib/compliance/pspf-nz-dta-crosswalk";
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

export async function runPspfNzDtaMonitoringPack(): Promise<{
  ok: boolean;
  period: string;
  pspfReady: boolean;
  nzDtaReady: boolean;
}> {
  if (!isPspfNzDtaEnabled()) {
    return { ok: true, period: "disabled", pspfReady: false, nzDtaReady: false };
  }

  const ev = buildPspfNzDtaEvidence();
  const outDir = process.env.PSPF_NZ_DTA_OUT_DIR?.trim() || "/tmp/pspf-nz-dta";
  mkdirSync(outDir, { recursive: true });

  const jsonBody = JSON.stringify(ev, null, 2);
  writeFileSync(join(outDir, `monitoring-${ev.period}.json`), jsonBody, "utf-8");

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const jsonUploaded = await uploadAuditCsvToS3WithLock({
    key: `${prefix}/pspf-nz-dta/${ev.period}/monitoring.json`,
    body: jsonBody,
    contentType: "application/json",
  });
  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/pspf-nz-dta/${ev.period}/monitoring.pdf`,
    body: simplePdf(pspfNzDtaPdfLines(ev)),
    contentType: "application/pdf",
  });
  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/pspf-nz-dta/${ev.period}/manifest.json`,
    body: JSON.stringify({
      period: ev.period,
      pspfReady: ev.pspfReady,
      nzDtaReady: ev.nzDtaReady,
      sha256: createHash("sha256").update(jsonBody).digest("hex"),
    }),
    contentType: "application/json",
  });

  return { ok: jsonUploaded, period: ev.period, pspfReady: ev.pspfReady, nzDtaReady: ev.nzDtaReady };
}
