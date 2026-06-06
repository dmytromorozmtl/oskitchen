/**
 * SLA Monitoring smoke summary — wiring audit (Era 141).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SLA_MONITORING_ERA141_CAPABILITIES,
  SLA_MONITORING_ERA141_POLICY_ID,
  SLA_MONITORING_ERA141_ROUTE,
  SLA_MONITORING_ERA141_SERVICE,
  SLA_MONITORING_ERA141_WIRING_PATHS,
} from "@/lib/enterprise/sla-monitoring-era141-policy";

export const SLA_MONITORING_SMOKE_SUMMARY_VERSION = SLA_MONITORING_ERA141_POLICY_ID;

export type SlaMonitoringSmokeEra141Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SlaMonitoringSmokeEra141ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SlaMonitoringSmokeEra141Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SlaMonitoringSmokeEra141Summary = {
  version: typeof SLA_MONITORING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SlaMonitoringSmokeEra141Overall;
  proofStatus: SlaMonitoringSmokeEra141ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: SlaMonitoringSmokeEra141Step[];
  honestyNote: string;
};

export function auditSlaMonitoringSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of SLA_MONITORING_ERA141_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === SLA_MONITORING_ERA141_SERVICE) {
      if (!src.includes("loadEnterpriseSlaMonitoringDashboard")) {
        failures.push("sla-service.ts missing loadEnterpriseSlaMonitoringDashboard");
      }
      if (!src.includes("checkDatabaseHealth")) {
        failures.push("sla-service.ts missing checkDatabaseHealth");
      }
      if (!src.includes("loadLiveIntegrationHealthDashboard")) {
        failures.push("sla-service.ts missing loadLiveIntegrationHealthDashboard");
      }
      if (!src.includes("loadCriticalCronExecutionHealth")) {
        failures.push("sla-service.ts missing loadCriticalCronExecutionHealth");
      }
      if (!src.includes("buildSlaMonitoringDashboard")) {
        failures.push("sla-service.ts missing buildSlaMonitoringDashboard");
      }
    }

    if (rel === "lib/enterprise/sla-monitoring-builders.ts") {
      if (!src.includes("buildSlaMonitoringDashboard")) {
        failures.push("sla-monitoring-builders.ts missing buildSlaMonitoringDashboard");
      }
      if (!src.includes("buildSlaSignals")) {
        failures.push("sla-monitoring-builders.ts missing buildSlaSignals");
      }
      if (!src.includes("buildSlaAlerts")) {
        failures.push("sla-monitoring-builders.ts missing buildSlaAlerts");
      }
      if (!src.includes("listSlaMonitoringSignalIds")) {
        failures.push("sla-monitoring-builders.ts missing listSlaMonitoringSignalIds");
      }
    }

    if (rel === "lib/enterprise/sla-monitoring-policy.ts") {
      if (!src.includes("SLA_MONITORING_POLICY_ID")) {
        failures.push("sla-monitoring-policy.ts missing policy id");
      }
      if (!src.includes("SLA_MONITORING_PATH")) {
        failures.push("sla-monitoring-policy.ts missing route path");
      }
      if (!src.includes("SLA_MONITORING_SIGNALS")) {
        failures.push("sla-monitoring-policy.ts missing monitoring signals");
      }
      if (!src.includes("ENTERPRISE_SLA_UPTIME_TARGET_PCT")) {
        failures.push("sla-monitoring-policy.ts missing uptime target");
      }
      if (!src.includes("ENTERPRISE_SLA_RESPONSE_TIME_TARGET_MS")) {
        failures.push("sla-monitoring-policy.ts missing response time target");
      }
    }

    if (rel === "app/dashboard/enterprise/sla/page.tsx") {
      if (!src.includes("loadEnterpriseSlaMonitoringDashboard")) {
        failures.push("sla page missing loadEnterpriseSlaMonitoringDashboard");
      }
      if (!src.includes("SlaMonitoringPanel")) {
        failures.push("sla page missing SlaMonitoringPanel");
      }
      if (
        !src.includes(
          "Enterprise uptime, response time, and alerting across platform and integration fleet",
        )
      ) {
        failures.push("sla page missing enterprise SLA copy");
      }
    }

    if (rel === "components/enterprise/sla-monitoring-panel.tsx") {
      if (!src.includes("sla-monitoring-panel")) {
        failures.push("sla-monitoring-panel.tsx missing root test id");
      }
      if (!src.includes("SLA monitoring")) {
        failures.push("sla-monitoring-panel.tsx missing SLA monitoring title");
      }
      if (!src.includes("SLA signals")) {
        failures.push("sla-monitoring-panel.tsx missing SLA signals section");
      }
      if (!src.includes("sla-signals-card")) {
        failures.push("sla-monitoring-panel.tsx missing sla-signals-card test id");
      }
      if (!src.includes("Active alerts")) {
        failures.push("sla-monitoring-panel.tsx missing active alerts section");
      }
      if (!src.includes("sla-alerts-card")) {
        failures.push("sla-monitoring-panel.tsx missing sla-alerts-card test id");
      }
      if (!src.includes("Uptime")) {
        failures.push("sla-monitoring-panel.tsx missing uptime KPI");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveSlaMonitoringSmokeEra141ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SlaMonitoringSmokeEra141ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSlaMonitoringSmokeEra141Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): SlaMonitoringSmokeEra141Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveSlaMonitoringSmokeEra141ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SlaMonitoringSmokeEra141Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SlaMonitoringSmokeEra141Step[] = [
    {
      id: "wiring_audit",
      label: "Uptime → response time → predictive alerts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 141 SLA Monitoring cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: SLA_MONITORING_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: SLA_MONITORING_ERA141_ROUTE,
    capabilities: SLA_MONITORING_ERA141_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires production health probes and integration fleet data.",
  };
}

export function formatSlaMonitoringSmokeEra141ReportLines(
  summary: SlaMonitoringSmokeEra141Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
