/**
 * KDS Production View smoke summary — wiring audit (Era 100).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_PRODUCTION_VIEW_ERA100_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA100_ROUTE,
  KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS,
} from "@/lib/kitchen/kds-production-view-era100-policy";

export const KDS_PRODUCTION_VIEW_SMOKE_SUMMARY_VERSION = KDS_PRODUCTION_VIEW_ERA100_POLICY_ID;

export type KdsProductionViewSmokeEra100Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsProductionViewSmokeEra100ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsProductionViewSmokeEra100Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsProductionViewSmokeEra100Summary = {
  version: typeof KDS_PRODUCTION_VIEW_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsProductionViewSmokeEra100Overall;
  proofStatus: KdsProductionViewSmokeEra100ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  steps: KdsProductionViewSmokeEra100Step[];
  honestyNote: string;
};

export function auditKdsProductionViewSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/kitchen/kds-production-view.ts") {
      if (!src.includes("buildProductionViewSnapshot")) {
        failures.push("kds-production-view.ts missing buildProductionViewSnapshot");
      }
      if (!src.includes("bottleneckStation")) {
        failures.push("kds-production-view.ts missing bottleneckStation");
      }
      if (!src.includes("kitchenEtaMinutes")) {
        failures.push("kds-production-view.ts missing kitchenEtaMinutes");
      }
    }

    if (rel === "components/kitchen/production-view-client.tsx") {
      if (!src.includes("kds-production-view-root")) {
        failures.push("production-view-client.tsx missing root test id");
      }
      if (!src.includes("kds-production-station-card")) {
        failures.push("production-view-client.tsx missing station cards");
      }
      if (!src.includes("Bottleneck")) {
        failures.push("production-view-client.tsx missing bottleneck UI");
      }
      if (!src.includes("kitchenEtaMinutes")) {
        failures.push("production-view-client.tsx missing kitchen ETA display");
      }
    }

    if (rel === "app/dashboard/kitchen/production/page.tsx") {
      if (!src.includes("ProductionViewClient")) {
        failures.push("production page missing ProductionViewClient");
      }
      if (!src.includes("loadKdsProductionView")) {
        failures.push("production page missing loadKdsProductionView");
      }
    }

    if (rel === "lib/kitchen/kds-production-view-policy.ts") {
      if (!src.includes(KDS_PRODUCTION_VIEW_ERA100_ROUTE)) {
        failures.push("kds-production-view-policy.ts missing production route");
      }
    }

    if (rel === "services/kitchen/multi-station-service.ts") {
      if (!src.includes("loadKdsProductionView")) {
        failures.push("multi-station-service.ts missing loadKdsProductionView");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveKdsProductionViewSmokeEra100ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsProductionViewSmokeEra100ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsProductionViewSmokeEra100Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): KdsProductionViewSmokeEra100Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveKdsProductionViewSmokeEra100ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsProductionViewSmokeEra100Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsProductionViewSmokeEra100Step[] = [
    {
      id: "wiring_audit",
      label: "Active tickets → station load → bottleneck detection → kitchen ETA",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 100 KDS Production View cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: KDS_PRODUCTION_VIEW_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: KDS_PRODUCTION_VIEW_ERA100_ROUTE,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live rush-hour proof requires staging tenant with active tickets.",
  };
}

export function formatKdsProductionViewSmokeEra100ReportLines(
  summary: KdsProductionViewSmokeEra100Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
