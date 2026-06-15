import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-14 — QR ordering pilot story policy (sales-safe scan-to-kitchen narrative).
 *
 * @see docs/qr-ordering-pilot-story.md
 * @see docs/qr-code-ordering-plan.md
 */

export const QR_ORDERING_PILOT_STORY_POLICY_ID = "qr-ordering-pilot-story-mkt14-v1" as const;

export const QR_ORDERING_PILOT_STORY_DOC = "docs/qr-ordering-pilot-story.md" as const;

export const QR_ORDERING_PILOT_ONE_LINE_PITCH =
  "Print a QR. Guest orders from their phone. Ticket hits the same kitchen queue as counter sales — with honest BETA labels until table metadata and staging E2E PASS." as const;

/** Five-beat story arc for demos and outbound. */
export const QR_ORDERING_PILOT_STORY_BEATS = [
  { id: "pain", label: "The pain", durationSec: 20 },
  { id: "wedge", label: "The wedge", durationSec: 25 },
  { id: "today", label: "What works today", durationSec: 40 },
  { id: "pilot", label: "Pilot offer", durationSec: 25 },
  { id: "close", label: "Honest close", durationSec: 10 },
] as const;

export const QR_ORDERING_PILOT_ICP_SEGMENTS = [
  "Fast casual / counter + patio",
  "Café with table numbers",
  "Ghost kitchen pickup counter",
  "Meal prep with dine-in corner",
] as const;

export const QR_ORDERING_PILOT_PRIMARY_CTA = {
  label: "Book QR pilot fit call",
  href: "/book-demo?utm_source=qr-pilot-story&utm_medium=sales&utm_campaign=qr-ordering-mkt14",
} as const;

export const QR_ORDERING_PILOT_FORBIDDEN_CLAIMS = [
  "full-service qr table service",
  "realtime floor plan",
  "toast qr parity",
  "touchbistro qr parity",
  "kiosk ordering live",
  "pay-at-table included",
  "thousands of qr orders",
  "always auto-route to kds",
] as const;

export const QR_ORDERING_PILOT_STORY_REQUIRED_HEADINGS = [
  "One-line pitch",
  "Story arc (2 minutes)",
  "Approved demo script (30 seconds)",
  "Forbidden claims",
  "Pilot week 1 checklist",
] as const;

export type QrOrderingPilotStoryDocAudit = {
  docPath: typeof QR_ORDERING_PILOT_STORY_DOC;
  missingHeadings: string[];
  storyBeatCount: number;
  passed: boolean;
};

export function totalQrPilotStoryDurationSec(): number {
  return QR_ORDERING_PILOT_STORY_BEATS.reduce((sum, beat) => sum + beat.durationSec, 0);
}

export function auditQrOrderingPilotStoryDoc(root = process.cwd()): QrOrderingPilotStoryDocAudit {
  const source = readFileSync(join(root, QR_ORDERING_PILOT_STORY_DOC), "utf8");
  const missingHeadings = QR_ORDERING_PILOT_STORY_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: QR_ORDERING_PILOT_STORY_DOC,
    missingHeadings,
    storyBeatCount: QR_ORDERING_PILOT_STORY_BEATS.length,
    passed: missingHeadings.length === 0,
  };
}

export type QrOrderingPilotStoryLint = {
  forbiddenHits: string[];
  passed: boolean;
};

/** Lint outbound or deck copy before send. */
export function lintQrOrderingPilotStoryCopy(source: string): QrOrderingPilotStoryLint {
  const lower = source.toLowerCase();
  const forbiddenHits = QR_ORDERING_PILOT_FORBIDDEN_CLAIMS.filter((claim) =>
    lower.includes(claim),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
