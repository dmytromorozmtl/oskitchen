/**
 * P2-36 — Live Sentry alert firing verification (staging/production).
 *
 * Usage:
 *   ENABLE_EXPERIMENTAL_CRONS=true CRON_SECRET=... STAGING_URL=https://... npm run run:sentry-alert-firing-p2-36
 *   SENTRY_ALERT_FIRING_LIVE=true ... npm run run:sentry-alert-firing-p2-36
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
  SENTRY_ALERT_FIRING_P2_36_ARTIFACT,
  SENTRY_ALERT_FIRING_P2_36_POLICY_ID,
  buildSentryAlertFiringP2_36TriggerUrl,
  hasSentryAlertFiringP2_36LiveCredentials,
  isSentryAlertFiringP2_36LiveEnabled,
  isWithinSentryAlertFiringP2_36Sla,
} from "@/lib/qa/sentry-alert-firing-p2-36-policy";

type Summary = {
  policyId: typeof SENTRY_ALERT_FIRING_P2_36_POLICY_ID;
  mode: "dry_run" | "live";
  triggerUrl: string | null;
  httpStatus: number | null;
  triggerOk: boolean;
  alertSlaMs: number;
  withinSla: boolean | null;
  elapsedMs: number | null;
  note: string;
};

function resolveBaseUrl(): string | null {
  return (
    process.env.SENTRY_ALERT_FIRING_BASE_URL?.trim() ||
    process.env.STAGING_URL?.trim() ||
    process.env.SENTRY_VERIFY_HEALTH_URL?.trim()?.replace(/\/api\/health\/?$/, "") ||
    null
  );
}

function writeSummary(summary: Summary): void {
  const path = join(process.cwd(), SENTRY_ALERT_FIRING_P2_36_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const live = isSentryAlertFiringP2_36LiveEnabled() && !dryRun;

  if (!live) {
    const summary: Summary = {
      policyId: SENTRY_ALERT_FIRING_P2_36_POLICY_ID,
      mode: "dry_run",
      triggerUrl: null,
      httpStatus: null,
      triggerOk: false,
      alertSlaMs: SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
      withinSla: null,
      elapsedMs: null,
      note:
        "Dry run — set SENTRY_ALERT_FIRING_LIVE=true with CRON_SECRET + STAGING_URL to trigger live verification.",
    };
    writeSummary(summary);
    console.log(JSON.stringify(summary, null, 2));
    console.log("\nDry run complete. Use npm run audit:sentry-alert-firing-p2-36 for wiring audit.");
    return;
  }

  if (!hasSentryAlertFiringP2_36LiveCredentials()) {
    console.error("Missing CRON_SECRET and base URL (STAGING_URL or SENTRY_ALERT_FIRING_BASE_URL).");
    process.exit(1);
  }

  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    console.error("Could not resolve staging base URL.");
    process.exit(1);
  }

  const triggerUrl = buildSentryAlertFiringP2_36TriggerUrl(baseUrl, true);
  const secret = process.env.CRON_SECRET!.trim();
  const started = Date.now();

  let httpStatus = 0;
  try {
    const response = await fetch(triggerUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}`, accept: "application/json" },
      cache: "no-store",
    });
    httpStatus = response.status;
  } catch (error) {
    console.error(`fetch_error=${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const elapsedMs = Date.now() - started;
  const triggerOk = httpStatus === 500;
  const withinSla = isWithinSentryAlertFiringP2_36Sla(elapsedMs);

  const summary: Summary = {
    policyId: SENTRY_ALERT_FIRING_P2_36_POLICY_ID,
    mode: "live",
    triggerUrl,
    httpStatus,
    triggerOk,
    alertSlaMs: SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
    withinSla,
    elapsedMs,
    note: triggerOk
      ? "Trigger returned 500 with cron_failure — confirm issue in Sentry within 5 minutes (ops_signal:cron_failure)."
      : `Expected HTTP 500 from fail=1 trigger; got ${httpStatus}. Ensure ENABLE_EXPERIMENTAL_CRONS=true on target.`,
  };

  writeSummary(summary);
  console.log(JSON.stringify(summary, null, 2));

  if (!triggerOk) {
    process.exit(1);
  }

  console.log("\n✓ Sentry alert trigger fired. Confirm alert delivery in Sentry UI within 5 minutes.");
}

void main();
