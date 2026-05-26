import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildIso27001Attestation,
  currentQuarterLabel,
  iso27001AttestationPdfLines,
} from "@/lib/compliance/iso27001-crosswalk";
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

export async function runIso27001QuarterlyAttestation(): Promise<{
  ok: boolean;
  quarter: string;
  s3Uploaded: boolean;
  outPath?: string;
}> {
  const att = buildIso27001Attestation();
  const outDir = process.env.ISO27001_ATTESTATION_OUT_DIR?.trim() || "/tmp/iso27001-attestation";
  mkdirSync(outDir, { recursive: true });

  const jsonBody = JSON.stringify(att, null, 2);
  const pdfBody = simplePdf(iso27001AttestationPdfLines(att));
  const jsonPath = join(outDir, `attestation-${att.quarter}.json`);
  const pdfPath = join(outDir, `attestation-${att.quarter}.pdf`);

  writeFileSync(jsonPath, jsonBody, "utf-8");
  writeFileSync(pdfPath, pdfBody, "utf-8");

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const jsonUploaded = await uploadAuditCsvToS3WithLock({
    key: `${prefix}/iso27001/${att.quarter}/attestation.json`,
    body: jsonBody,
    contentType: "application/json",
  });
  const pdfUploaded = await uploadAuditCsvToS3WithLock({
    key: `${prefix}/iso27001/${att.quarter}/attestation.pdf`,
    body: pdfBody,
    contentType: "application/pdf",
  });

  const manifest = {
    quarter: currentQuarterLabel(),
    jsonSha256: createHash("sha256").update(jsonBody).digest("hex"),
    pdfSha256: createHash("sha256").update(pdfBody).digest("hex"),
    generatedAt: att.generatedAt,
  };
  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/iso27001/${att.quarter}/manifest.json`,
    body: JSON.stringify(manifest, null, 2),
    contentType: "application/json",
  });

  return {
    ok: jsonUploaded || pdfUploaded,
    quarter: att.quarter,
    s3Uploaded: jsonUploaded && pdfUploaded,
    outPath: pdfPath,
  };
}
