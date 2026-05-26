/**
 * Step 4 — Go/no-go gate for POST_BETA_EPIC (Loyalty, SMS, P&L).
 *
 *   npm run beta:go-no-go
 *   npm run beta:go-no-go -- --record-decision=go --by="Founder"
 *   npm run beta:go-no-go -- --record-decision=no-go --reason="..."
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadCohortRegistry } from "@/lib/beta-ops/cohort-registry";
import { renderExecutiveSummary } from "@/lib/beta-ops/executive-summary";
import { loadBetaEnv } from "@/lib/beta-ops/load-beta-env";
import type { DailyOpsReport } from "@/lib/beta-ops/types";
import { loadProgramState, markStep, saveProgramState } from "@/lib/beta-ops/program-state";
import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";

const OUT_PATH = join(process.cwd(), "docs", "artifacts", "BETA_GO_NO_GO.json");

type GoNoGoCriteria = {
  minLiveKitchens: number;
  minTotalOrders7d: number;
  maxUnhealthyDaysRatio: number;
  requireZeroP0Incidents: boolean;
};

const DEFAULT_CRITERIA: GoNoGoCriteria = {
  minLiveKitchens: 3,
  minTotalOrders7d: 30,
  maxUnhealthyDaysRatio: 0.3,
  requireZeroP0Incidents: true,
};

function loadDailyOps(artifacts: string): DailyOpsReport[] {
  if (!existsSync(artifacts)) return [];
  return readdirSync(artifacts)
    .filter((f) => f.startsWith("BETA_DAILY_OPS_") && f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(artifacts, f), "utf8")) as DailyOpsReport);
}

async function main() {
  loadBetaEnv();
  const recordDecision = process.argv.find((a) => a.startsWith("--record-decision="))?.split("=")[1];
  const by = process.argv.find((a) => a.startsWith("--by="))?.split("=").slice(1).join("=");
  const reason = process.argv.find((a) => a.startsWith("--reason="))?.split("=").slice(1).join("=");

  console.log("=== Step 4: Post-beta epic go/no-go ===\n");

  const registry = loadCohortRegistry();
  const liveEmails =
    registry?.kitchens.filter((k) => k.status === "live").map((k) => k.email) ?? [];

  const reports = loadDailyOps(join(process.cwd(), "docs", "artifacts"));
  const unhealthyDays = reports.filter((r) => r.summary.unhealthy > 0).length;
  const unhealthyRatio = reports.length ? unhealthyDays / reports.length : 0;

  let totalOrders7d = 0;
  for (const email of liveEmails) {
    const p = await runKitchenPreflight(email);
    if (p) totalOrders7d += p.metrics.ordersLast7d;
  }

  const p0Path = join(process.cwd(), "docs", "artifacts", "BETA_P0_INCIDENTS.json");
  let p0Count = 0;
  if (existsSync(p0Path)) {
    try {
      const p0 = JSON.parse(readFileSync(p0Path, "utf8")) as {
        incidents?: Array<{ severity?: string; resolvedAt?: string }>;
      };
      p0Count =
        p0.incidents?.filter((i) => i.severity === "P0" && !i.resolvedAt).length ?? 0;
    } catch {
      p0Count = 0;
    }
  }

  const checks = {
    liveKitchens: {
      ok: liveEmails.length >= DEFAULT_CRITERIA.minLiveKitchens,
      value: liveEmails.length,
      required: DEFAULT_CRITERIA.minLiveKitchens,
    },
    totalOrders7d: {
      ok: totalOrders7d >= DEFAULT_CRITERIA.minTotalOrders7d,
      value: totalOrders7d,
      required: DEFAULT_CRITERIA.minTotalOrders7d,
    },
    unhealthyDaysRatio: {
      ok: unhealthyRatio <= DEFAULT_CRITERIA.maxUnhealthyDaysRatio,
      value: unhealthyRatio,
      required: DEFAULT_CRITERIA.maxUnhealthyDaysRatio,
    },
    p0Incidents: {
      ok: !DEFAULT_CRITERIA.requireZeroP0Incidents || p0Count === 0,
      value: p0Count,
      note: "Record incidents in docs/artifacts/BETA_P0_INCIDENTS.json",
    },
  };

  const recommendation = Object.values(checks).every((c) => c.ok) ? "go" : "no-go";

  for (const [name, c] of Object.entries(checks)) {
    console.log(`${c.ok ? "OK" : "FAIL"}  ${name}: ${JSON.stringify(c)}`);
  }
  console.log(`\nRecommendation: ${recommendation.toUpperCase()}`);

  const payload = {
    generatedAt: new Date().toISOString(),
    criteria: DEFAULT_CRITERIA,
    checks,
    recommendation,
    decision: recordDecision ?? null,
    decidedBy: by ?? null,
    reason: reason ?? null,
    liveKitchens: liveEmails,
  };

  mkdirSync(join(process.cwd(), "docs", "artifacts"), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nWrote ${OUT_PATH}`);

  if (recordDecision) {
    const state = loadProgramState();
    markStep(state, 4, {
      ok: recordDecision === "go",
      notes: reason ?? recommendation,
      artifact: OUT_PATH,
    });
    saveProgramState(state);
    writeFileSync(
      join(process.cwd(), "docs", "artifacts", "BETA_EXECUTIVE_SUMMARY.md"),
      renderExecutiveSummary(state),
      "utf8",
    );
    console.log(`Decision recorded: ${recordDecision}`);
  } else {
    console.log("\nRecord: npm run beta:go-no-go -- --record-decision=go --by=\"Name\"");
  }

  if (recommendation === "no-go" && !recordDecision) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
