import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildSoc2Type2EvidenceBinder,
  EXPERIMENT_CRON_CONTROLS,
  type Soc2EvidenceBinder,
} from "@/lib/compliance/soc2-control-mapping";
import { uploadAuditCsvToS3WithLock } from "@/services/storefront/storefront-experiment-audit-archive-service";

function simplePdfLines(binder: Soc2EvidenceBinder): string {
  const lines = [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj`,
  ];
  const text = [
    `SOC2 Type II Evidence Binder — ${binder.period}`,
    `Generated: ${binder.generatedAt}`,
    "",
    ...binder.controls.flatMap((c) => [
      `Control ${c.controlId} — ${c.status}`,
      `Crons: ${c.cronPaths.join(", ")}`,
      `Artifacts: ${c.evidenceArtifacts.join("; ")}`,
      "",
    ]),
    `Mapped crons: ${EXPERIMENT_CRON_CONTROLS.length}`,
  ].join("\\n");
  lines.push(
    `4 0 obj << /Length ${text.length + 50} >> stream`,
    `BT /F1 10 Tf 50 750 Td (${text.slice(0, 2000).replace(/[()\\]/g, " ")}) Tj ET`,
    "endstream endobj",
    "xref",
    "0 5",
    "trailer << /Size 5 /Root 1 0 R >>",
    "startxref",
    "0",
    "%%EOF",
  );
  return lines.join("\n");
}

export async function runSoc2Type2EvidenceBinder(): Promise<{
  ok: boolean;
  period: string;
  s3Uploaded: boolean;
  outPath?: string;
  error?: string;
}> {
  const binder = buildSoc2Type2EvidenceBinder();
  const outDir = process.env.SOC2_TYPE2_OUT_DIR?.trim() || "/tmp/soc2-type2-evidence";
  mkdirSync(outDir, { recursive: true });

  const jsonPath = join(outDir, `binder-${binder.period}.json`);
  const pdfPath = join(outDir, `binder-${binder.period}.pdf`);
  const jsonBody = JSON.stringify(binder, null, 2);
  const pdfBody = simplePdfLines(binder);

  writeFileSync(jsonPath, jsonBody, "utf-8");
  writeFileSync(pdfPath, pdfBody, "utf-8");

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const jsonKey = `${prefix}/soc2/type2/${binder.period}/evidence-binder.json`;
  const pdfKey = `${prefix}/soc2/type2/${binder.period}/evidence-binder.pdf`;

  const jsonUploaded = await uploadAuditCsvToS3WithLock({
    key: jsonKey,
    body: jsonBody,
    contentType: "application/json",
  });
  const pdfUploaded = await uploadAuditCsvToS3WithLock({
    key: pdfKey,
    body: pdfBody,
    contentType: "application/pdf",
  });

  const manifest = {
    generatedAt: binder.generatedAt,
    period: binder.period,
    jsonSha256: createHash("sha256").update(jsonBody).digest("hex"),
    pdfSha256: createHash("sha256").update(pdfBody).digest("hex"),
    controlCount: binder.controls.length,
  };

  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/soc2/type2/${binder.period}/manifest.json`,
    body: JSON.stringify(manifest, null, 2),
    contentType: "application/json",
  });

  return {
    ok: jsonUploaded || pdfUploaded,
    period: binder.period,
    s3Uploaded: jsonUploaded && pdfUploaded,
    outPath: pdfPath,
  };
}
