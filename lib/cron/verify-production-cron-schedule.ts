import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS,
  PRODUCTION_CRON_SCHEDULES,
  type ProductionCronSlug,
} from "@/services/cron/production-manifest";
import {
  assertProductionCronReconciliation,
  reconcileProductionCronState,
  type ProductionCronReconciliationReport,
} from "@/services/cron/cron-reconciliation";

/** Task P0-1 critical crons — must be scheduled in vercel.json and write heartbeats. */
export const P0_CRITICAL_CRON_SLUGS = [
  "webhook-jobs",
  "storefront-edge-sync",
  "doordash-sync",
  "grubhub-sync",
  "kds-overdue-alerts",
] as const satisfies readonly ProductionCronSlug[];

export type CriticalCronScheduleRow = {
  slug: ProductionCronSlug;
  schedule: string;
  path: string;
  inVercelJson: boolean;
  scheduleMatch: boolean;
};

export type CronLiveProbeResult = {
  attempted: boolean;
  appUrl: string | null;
  health: { status: number; cronExecutionOk: boolean | null; productionFailure: string | null } | null;
  webhookJobsDryRun: { status: number; ok: boolean; body: unknown } | null;
};

export type ProductionCronScheduleVerification = {
  ok: boolean;
  verifiedAt: string;
  reconciliation: ProductionCronReconciliationReport;
  criticalCrons: CriticalCronScheduleRow[];
  evidenceSlugs: readonly ProductionCronSlug[];
  liveProbe: CronLiveProbeResult;
  failures: string[];
};

function readVercelCronSchedules(): Map<string, string> {
  const vercelPath = join(process.cwd(), "vercel.json");
  const parsed = JSON.parse(readFileSync(vercelPath, "utf8")) as {
    crons?: Array<{ path: string; schedule: string }>;
  };
  const map = new Map<string, string>();
  for (const entry of parsed.crons ?? []) {
    map.set(entry.path, entry.schedule);
  }
  return map;
}

function buildCriticalCronRows(vercelSchedules: Map<string, string>): CriticalCronScheduleRow[] {
  return P0_CRITICAL_CRON_SLUGS.map((slug) => {
    const path = `/api/cron/${slug}`;
    const expected = PRODUCTION_CRON_SCHEDULES[slug];
    const actual = vercelSchedules.get(path);
    return {
      slug,
      schedule: expected,
      path,
      inVercelJson: actual != null,
      scheduleMatch: actual === expected,
    };
  });
}

async function probeLiveCronHealth(appUrl: string, cronSecret?: string): Promise<CronLiveProbeResult> {
  const base = appUrl.replace(/\/$/, "");
  const result: CronLiveProbeResult = {
    attempted: true,
    appUrl: base,
    health: null,
    webhookJobsDryRun: null,
  };

  try {
    const healthRes = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(30_000) });
    const healthBody = (await healthRes.json().catch(() => ({}))) as {
      checks?: {
        cronExecution?: { ok?: boolean; productionFailure?: string | null };
      };
    };
    result.health = {
      status: healthRes.status,
      cronExecutionOk: healthBody.checks?.cronExecution?.ok ?? null,
      productionFailure: healthBody.checks?.cronExecution?.productionFailure ?? null,
    };
  } catch {
    result.health = { status: 0, cronExecutionOk: null, productionFailure: "health_fetch_failed" };
  }

  if (cronSecret?.trim()) {
    try {
      const cronRes = await fetch(`${base}/api/cron/webhook-jobs?dryRun=1`, {
        headers: { Authorization: `Bearer ${cronSecret.trim()}` },
        signal: AbortSignal.timeout(30_000),
      });
      const body = await cronRes.json().catch(() => ({}));
      result.webhookJobsDryRun = {
        status: cronRes.status,
        ok: cronRes.status === 200 && (body as { ok?: boolean }).ok === true,
        body,
      };
    } catch {
      result.webhookJobsDryRun = { status: 0, ok: false, body: { error: "cron_fetch_failed" } };
    }
  }

  return result;
}

export function verifyProductionCronScheduleLocal(): ProductionCronScheduleVerification {
  const reconciliation = reconcileProductionCronState();
  const vercelSchedules = readVercelCronSchedules();
  const criticalCrons = buildCriticalCronRows(vercelSchedules);
  const failures: string[] = [];

  if (!reconciliation.ok) {
    try {
      assertProductionCronReconciliation(reconciliation);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  for (const row of criticalCrons) {
    if (!row.inVercelJson) {
      failures.push(`critical cron missing from vercel.json: ${row.path}`);
    } else if (!row.scheduleMatch) {
      failures.push(
        `critical cron schedule mismatch ${row.path}: vercel=${vercelSchedules.get(row.path)} manifest=${row.schedule}`,
      );
    }
  }

  for (const slug of CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS) {
    if (!PRODUCTION_CRON_SCHEDULES[slug]) {
      failures.push(`critical evidence slug missing schedule in manifest: ${slug}`);
    }
  }

  return {
    ok: failures.length === 0,
    verifiedAt: new Date().toISOString(),
    reconciliation,
    criticalCrons,
    evidenceSlugs: CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS,
    liveProbe: {
      attempted: false,
      appUrl: null,
      health: null,
      webhookJobsDryRun: null,
    },
    failures,
  };
}

export async function verifyProductionCronSchedule(options?: {
  appUrl?: string;
  cronSecret?: string;
}): Promise<ProductionCronScheduleVerification> {
  const local = verifyProductionCronScheduleLocal();
  const appUrl = options?.appUrl?.trim() || process.env.APP_URL?.trim() || process.env.PRODUCTION_URL?.trim();
  if (!appUrl) {
    return local;
  }

  const liveProbe = await probeLiveCronHealth(appUrl, options?.cronSecret ?? process.env.CRON_SECRET);
  const failures = [...local.failures];

  if (liveProbe.health?.cronExecutionOk === false) {
    failures.push(
      liveProbe.health.productionFailure ??
        "production /api/health reports cronExecution.ok=false — verify Vercel cron triggers and CRON_SECRET",
    );
  }
  if (liveProbe.webhookJobsDryRun && !liveProbe.webhookJobsDryRun.ok) {
    failures.push(
      `webhook-jobs dry-run probe failed (HTTP ${liveProbe.webhookJobsDryRun.status}) — check CRON_SECRET and route auth`,
    );
  }

  return {
    ...local,
    ok: failures.length === 0,
    liveProbe,
    failures,
  };
}
