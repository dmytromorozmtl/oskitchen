import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-12 — 5-minute demo video script policy.
 *
 * @see docs/demo-video-script-5min.md
 * @see docs/demo-video-script-today.md (90s cut-down)
 */

export const DEMO_VIDEO_5MIN_POLICY_ID = "demo-video-script-5min-mkt12-v1" as const;

export const DEMO_VIDEO_5MIN_CANONICAL_DOC = "docs/demo-video-script-5min.md" as const;

export const DEMO_VIDEO_TODAY_CUT_DOC = "docs/demo-video-script-today.md" as const;

export const DEMO_VIDEO_5MIN_TARGET_SECONDS = 300 as const;

/** Seven acts — must sum to 300 seconds. */
export const DEMO_VIDEO_5MIN_SEGMENTS = [
  { id: "hook", label: "Hook", startSec: 0, endSec: 30, durationSec: 30 },
  { id: "today", label: "Today + briefing", startSec: 30, endSec: 75, durationSec: 45 },
  { id: "orders", label: "Orders + Integration Health", startSec: 75, endSec: 120, durationSec: 45 },
  { id: "kitchen", label: "Kitchen + KDS", startSec: 120, endSec: 165, durationSec: 45 },
  { id: "pos", label: "Software-first POS", startSec: 165, endSec: 210, durationSec: 45 },
  { id: "channels", label: "Channels + storefront", startSec: 210, endSec: 255, durationSec: 45 },
  { id: "close", label: "Profit + close", startSec: 255, endSec: 300, durationSec: 45 },
] as const;

export const DEMO_VIDEO_5MIN_REQUIRED_HEADINGS = [
  "Pre-recording checklist",
  "Act structure (5 minutes)",
  "Forbidden on-camera claims",
  "Timing map",
  "Full voiceover",
] as const;

export const DEMO_VIDEO_5MIN_FORBIDDEN_VO_PHRASES = [
  "replace toast overnight",
  "fully integrated",
  "proven roi",
  "live doordash",
  "rush-hour certified",
  "thousands of customers",
  "guaranteed roi",
  "production sso",
] as const;

export type DemoVideo5MinDocAudit = {
  docPath: typeof DEMO_VIDEO_5MIN_CANONICAL_DOC;
  missingHeadings: string[];
  segmentDurationTotalSec: number;
  passed: boolean;
};

export function totalDemoVideo5MinDurationSec(): number {
  return DEMO_VIDEO_5MIN_SEGMENTS.reduce((sum, seg) => sum + seg.durationSec, 0);
}

export function auditDemoVideo5MinDoc(root = process.cwd()): DemoVideo5MinDocAudit {
  const source = readFileSync(join(root, DEMO_VIDEO_5MIN_CANONICAL_DOC), "utf8");
  const missingHeadings = DEMO_VIDEO_5MIN_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const segmentDurationTotalSec = totalDemoVideo5MinDurationSec();

  return {
    docPath: DEMO_VIDEO_5MIN_CANONICAL_DOC,
    missingHeadings,
    segmentDurationTotalSec,
    passed:
      missingHeadings.length === 0 &&
      segmentDurationTotalSec === DEMO_VIDEO_5MIN_TARGET_SECONDS,
  };
}

export type DemoVideoVoiceoverLint = {
  forbiddenHits: string[];
  passed: boolean;
};

/** Lint draft VO text before recording — flags forbidden sales phrases. */
export function lintDemoVideoVoiceover(source: string): DemoVideoVoiceoverLint {
  const lower = source.toLowerCase();
  const forbiddenHits = DEMO_VIDEO_5MIN_FORBIDDEN_VO_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
