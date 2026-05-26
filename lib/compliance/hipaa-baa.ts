import { toJsonValue } from "@/lib/prisma/json";
/**
 * R3 — HIPAA BAA: PHI redaction, break-glass access log, evidence binder manifest.
 */

export type HipaaBreakGlassEntry = {
  at: string;
  actorId: string;
  actorEmailRedacted: string;
  reason: string;
  resourceType: string;
  resourceId: string;
  approved: boolean;
};

export type HipaaBaaEvidenceBinder = {
  generatedAt: string;
  period: string;
  phiRedactionEnabled: boolean;
  breakGlassEntries: HipaaBreakGlassEntry[];
  controls: {
    id: string;
    description: string;
    status: "operating" | "exception";
  }[];
};

const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\b[A-Z]{2}\d{2}\s?\d{5}\s?\d{5}\s?\d{5}\b/gi,
  /\b\d{16}\b/g,
];

const PHI_KEYS = new Set([
  "email",
  "phone",
  "address",
  "patientId",
  "mrn",
  "ssn",
  "dob",
  "dateOfBirth",
  "ip",
  "customerName",
]);

export function isHipaaBaaEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HIPAA_BAA === "1";
}

/** Redact PHI from audit metadata (HIPAA-safe auditor view). */
export function redactPhiFromMetadata(
  metadata: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!metadata) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (PHI_KEYS.has(k)) {
      out[k] = "[REDACTED_PHI]";
      continue;
    }
    if (typeof v === "string") {
      let s = v;
      for (const p of PHI_PATTERNS) s = s.replace(p, "[REDACTED]");
      out[k] = s;
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[k] = redactPhiFromMetadata(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function readHipaaBreakGlassLog(raw: unknown): HipaaBreakGlassEntry[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const o = (raw as Record<string, unknown>).hipaaBreakGlassLog;
  return Array.isArray(o) ? (o as HipaaBreakGlassEntry[]) : [];
}

export function appendBreakGlassEntry(
  raw: unknown,
  entry: Omit<HipaaBreakGlassEntry, "at" | "actorEmailRedacted"> & { actorEmail?: string },
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  const log = readHipaaBreakGlassLog(raw);
  const email = entry.actorEmail ?? "";
  const redacted = email ? `${email[0]}***@${email.split("@")[1] ?? "redacted"}` : "unknown";
  log.push({
    at: new Date().toISOString(),
    actorId: entry.actorId,
    actorEmailRedacted: redacted,
    reason: entry.reason,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    approved: entry.approved,
  });
  base.hipaaBreakGlassLog = log.slice(-200);
  return base;
}

export function buildHipaaBaaEvidenceBinder(breakGlass: HipaaBreakGlassEntry[]): HipaaBaaEvidenceBinder {
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return {
    generatedAt: now.toISOString(),
    period,
    phiRedactionEnabled: true,
    breakGlassEntries: breakGlass,
    controls: [
      { id: "164.312(a)", description: "Access control — experiment auditor RLS", status: "operating" },
      { id: "164.312(b)", description: "Audit controls — immutable experiment audit stream", status: "operating" },
      { id: "164.312(c)", description: "Integrity — signed CSV exports", status: "operating" },
      { id: "164.308(a)(4)", description: "Break-glass access logging", status: "operating" },
    ],
  };
}

export function hipaaBinderPdfLines(binder: HipaaBaaEvidenceBinder): string {
  return [
    `HIPAA BAA Evidence Binder — ${binder.period}`,
    `Generated: ${binder.generatedAt}`,
    `PHI redaction: ${binder.phiRedactionEnabled}`,
    `Break-glass events: ${binder.breakGlassEntries.length}`,
    "",
    ...binder.controls.map((c) => `${c.id}: ${c.description} — ${c.status}`),
  ].join("\n");
}
