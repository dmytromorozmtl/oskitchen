/**
 * KDS Manager View smoke summary — wiring audit (Era 102).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_MANAGER_VIEW_ERA102_PILLARS,
  KDS_MANAGER_VIEW_ERA102_POLICY_ID,
  KDS_MANAGER_VIEW_ERA102_ROUTE,
  KDS_MANAGER_VIEW_ERA102_WIRING_PATHS,
} from "@/lib/kitchen/kds-manager-view-era102-policy";

export const KDS_MANAGER_VIEW_SMOKE_SUMMARY_VERSION = KDS_MANAGER_VIEW_ERA102_POLICY_ID;

export type KdsManagerViewSmokeEra102Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsManagerViewSmokeEra102ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsManagerViewSmokeEra102Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsManagerViewSmokeEra102Summary = {
  version: typeof KDS_MANAGER_VIEW_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsManagerViewSmokeEra102Overall;
  proofStatus: KdsManagerViewSmokeEra102ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  pillars: readonly string[];
  steps: KdsManagerViewSmokeEra102Step[];
  honestyNote: string;
};

export function auditKdsManagerViewSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of KDS_MANAGER_VIEW_ERA102_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/kitchen/kds-manager-view.ts") {
      if (!src.includes("buildKdsManagerViewSnapshot")) {
        failures.push("kds-manager-view.ts missing buildKdsManagerViewSnapshot");
      }
      for (const pillar of KDS_MANAGER_VIEW_ERA102_PILLARS) {
        if (!src.includes(`${pillar}:`)) {
          failures.push(`kds-manager-view.ts missing ${pillar} section`);
        }
      }
      if (!src.includes("efficiencyScore")) {
        failures.push("kds-manager-view.ts missing efficiencyScore");
      }
    }

    if (rel === "components/kitchen/manager-view-client.tsx") {
      if (!src.includes("kds-manager-view-root")) {
        failures.push("manager-view-client.tsx missing root test id");
      }
      if (!src.includes("kds-manager-delays-panel")) {
        failures.push("manager-view-client.tsx missing delays panel");
      }
      if (!src.includes("kds-manager-efficiency-panel")) {
        failures.push("manager-view-client.tsx missing efficiency panel");
      }
      if (!src.includes("kds-manager-efficiency-score")) {
        failures.push("manager-view-client.tsx missing efficiency score");
      }
      if (!src.includes("kds-manager-alerts")) {
        failures.push("manager-view-client.tsx missing alerts panel");
      }
    }

    if (rel === "app/dashboard/kitchen/manager/page.tsx") {
      if (!src.includes("ManagerViewClient")) {
        failures.push("manager page missing ManagerViewClient");
      }
      if (!src.includes("loadKdsManagerView")) {
        failures.push("manager page missing loadKdsManagerView");
      }
    }

    if (rel === "lib/kitchen/kds-manager-view-policy.ts") {
      if (!src.includes(KDS_MANAGER_VIEW_ERA102_ROUTE)) {
        failures.push("kds-manager-view-policy.ts missing manager route");
      }
    }

    if (rel === "services/kitchen/manager-view-service.ts") {
      if (!src.includes("loadKdsManagerView")) {
        failures.push("manager-view-service.ts missing loadKdsManagerView");
      }
      if (!src.includes("buildKdsManagerViewSnapshot")) {
        failures.push("manager-view-service.ts missing buildKdsManagerViewSnapshot");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveKdsManagerViewSmokeEra102ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsManagerViewSmokeEra102ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsManagerViewSmokeEra102Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): KdsManagerViewSmokeEra102Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveKdsManagerViewSmokeEra102ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsManagerViewSmokeEra102Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsManagerViewSmokeEra102Step[] = [
    {
      id: "wiring_audit",
      label: "Production + expo + queue → performance / delays / efficiency manager dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 102 KDS Manager View cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: KDS_MANAGER_VIEW_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: KDS_MANAGER_VIEW_ERA102_ROUTE,
    pillars: KDS_MANAGER_VIEW_ERA102_PILLARS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live manager proof requires staging tenant with active kitchen flow.",
  };
}

export function formatKdsManagerViewSmokeEra102ReportLines(
  summary: KdsManagerViewSmokeEra102Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Pillars: ${summary.pillars.join(" · ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
