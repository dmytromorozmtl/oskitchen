/**
 * POS Customer Display smoke summary — wiring audit (Era 99).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_CUSTOMER_DISPLAY_ERA99_CHANNEL,
  POS_CUSTOMER_DISPLAY_ERA99_COMPONENT,
  POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA99_ROUTE,
  POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS,
} from "@/lib/pos/pos-customer-display-era99-policy";

export const POS_CUSTOMER_DISPLAY_SMOKE_SUMMARY_VERSION = POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID;

export type PosCustomerDisplaySmokeEra99Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosCustomerDisplaySmokeEra99ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosCustomerDisplaySmokeEra99Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosCustomerDisplaySmokeEra99Summary = {
  version: typeof POS_CUSTOMER_DISPLAY_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosCustomerDisplaySmokeEra99Overall;
  proofStatus: PosCustomerDisplaySmokeEra99ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  channel: string;
  steps: PosCustomerDisplaySmokeEra99Step[];
  honestyNote: string;
};

export function auditPosCustomerDisplaySmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === POS_CUSTOMER_DISPLAY_ERA99_COMPONENT) {
      if (!src.includes("CustomerDisplay")) {
        failures.push("customer-display.tsx missing CustomerDisplay export");
      }
      if (!src.includes("pos-customer-display")) {
        failures.push("customer-display.tsx missing root test id");
      }
      if (!src.includes("pos-customer-display-total")) {
        failures.push("customer-display.tsx missing total test id");
      }
    }

    if (rel === "components/pos/pos-customer-display-client.tsx") {
      if (!src.includes("subscribePosCustomerDisplayState")) {
        failures.push("pos-customer-display-client.tsx missing BroadcastChannel subscribe");
      }
      if (!src.includes("CustomerDisplay")) {
        failures.push("pos-customer-display-client.tsx missing CustomerDisplay mount");
      }
    }

    if (rel === "lib/pos/pos-multi-monitor.ts") {
      if (!src.includes("openPosCustomerDisplayWindow")) {
        failures.push("pos-multi-monitor.ts missing openPosCustomerDisplayWindow");
      }
      if (!src.includes("publishPosCustomerDisplayState")) {
        failures.push("pos-multi-monitor.ts missing publishPosCustomerDisplayState");
      }
      if (!src.includes(POS_CUSTOMER_DISPLAY_ERA99_CHANNEL)) {
        failures.push("pos-multi-monitor.ts missing customer display channel");
      }
    }

    if (rel === "app/dashboard/pos/terminal/customer-display/page.tsx") {
      if (!src.includes("PosCustomerDisplayClient")) {
        failures.push("customer-display page missing PosCustomerDisplayClient");
      }
    }

    if (rel === "components/dashboard/pos-terminal-client.tsx") {
      if (!src.includes("publishPosCustomerDisplayState")) {
        failures.push("pos-terminal-client.tsx missing publishPosCustomerDisplayState");
      }
      if (!src.includes("openPosCustomerDisplayWindow")) {
        failures.push("pos-terminal-client.tsx missing openPosCustomerDisplayWindow");
      }
      if (!src.includes("toggleCustomerDisplayWindow")) {
        failures.push("pos-terminal-client.tsx missing toggleCustomerDisplayWindow");
      }
    }

    if (rel === "lib/pos/pos-desktop-shortcuts-policy.ts") {
      if (!src.includes(POS_CUSTOMER_DISPLAY_ERA99_ROUTE)) {
        failures.push("pos-desktop-shortcuts-policy.ts missing customer display route");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosCustomerDisplaySmokeEra99ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosCustomerDisplaySmokeEra99ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosCustomerDisplaySmokeEra99Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosCustomerDisplaySmokeEra99Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosCustomerDisplaySmokeEra99ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosCustomerDisplaySmokeEra99Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosCustomerDisplaySmokeEra99Step[] = [
    {
      id: "wiring_audit",
      label:
        "Terminal cart → BroadcastChannel → second-screen CustomerDisplay popup (F8 toggle)",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 99 POS Customer Display cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_CUSTOMER_DISPLAY_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: POS_CUSTOMER_DISPLAY_ERA99_ROUTE,
    channel: POS_CUSTOMER_DISPLAY_ERA99_CHANNEL,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live second-monitor proof requires dual-display workstation.",
  };
}

export function formatPosCustomerDisplaySmokeEra99ReportLines(
  summary: PosCustomerDisplaySmokeEra99Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Channel: ${summary.channel}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
