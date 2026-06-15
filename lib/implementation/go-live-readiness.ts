import type { ReadinessCheckResult, ReadinessSnapshot } from "@/lib/implementation/implementation-types";

const SCORE_PER_PASS = 1;
const SCORE_PER_WARN = 0.5;

export function summariseChecks(checks: ReadinessCheckResult[]): ReadinessSnapshot {
  const required = checks.filter((c) => c.required);
  const passed = checks.filter((c) => c.status === "PASS").length * SCORE_PER_PASS;
  const warned = checks.filter((c) => c.status === "WARN").length * SCORE_PER_WARN;
  const total = checks.length;
  const score = total === 0 ? 0 : Math.round(((passed + warned) / total) * 100);

  const requiredFailing = required.filter((c) => c.status === "FAIL");
  const blockers = requiredFailing.map((c) => c.title);
  const warnings = checks.filter((c) => c.status === "WARN").map((c) => c.title);

  let band: ReadinessSnapshot["band"];
  if (requiredFailing.length > 0) band = "blocked";
  else if (score >= 85) band = "ready";
  else band = "needs_work";

  return {
    score,
    band,
    blockers,
    warnings,
    checkedAt: new Date().toISOString(),
    checks,
  };
}

export function canMarkReady(snapshot: ReadinessSnapshot | null): boolean {
  if (!snapshot) return false;
  return snapshot.band === "ready";
}

export function readinessBandColor(band: ReadinessSnapshot["band"]): "green" | "amber" | "red" {
  switch (band) {
    case "ready":
      return "green";
    case "needs_work":
      return "amber";
    case "blocked":
    default:
      return "red";
  }
}
