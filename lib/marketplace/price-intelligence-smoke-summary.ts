/**
 * Price Intelligence smoke summary — wiring audit (Era 118).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRICE_INTELLIGENCE_ERA118_CAPABILITIES,
  PRICE_INTELLIGENCE_ERA118_POLICY_ID,
  PRICE_INTELLIGENCE_ERA118_ROUTE,
  PRICE_INTELLIGENCE_ERA118_SERVICE,
  PRICE_INTELLIGENCE_ERA118_WIRING_PATHS,
} from "@/lib/marketplace/price-intelligence-era118-policy";

export const PRICE_INTELLIGENCE_SMOKE_SUMMARY_VERSION = PRICE_INTELLIGENCE_ERA118_POLICY_ID;

export type PriceIntelligenceSmokeEra118Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PriceIntelligenceSmokeEra118ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PriceIntelligenceSmokeEra118Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PriceIntelligenceSmokeEra118Summary = {
  version: typeof PRICE_INTELLIGENCE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PriceIntelligenceSmokeEra118Overall;
  proofStatus: PriceIntelligenceSmokeEra118ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: PriceIntelligenceSmokeEra118Step[];
  honestyNote: string;
};

export function auditPriceIntelligenceSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of PRICE_INTELLIGENCE_ERA118_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === PRICE_INTELLIGENCE_ERA118_SERVICE) {
      if (!src.includes("loadPriceIntelligenceSnapshot")) {
        failures.push("price-intelligence.ts missing loadPriceIntelligenceSnapshot");
      }
      if (!src.includes("buildPriceIntelligenceSnapshot")) {
        failures.push("price-intelligence.ts missing buildPriceIntelligenceSnapshot");
      }
      if (!src.includes("findCheapestSupplier")) {
        failures.push("price-intelligence.ts missing findCheapestSupplier");
      }
      if (!src.includes("resolvePriceIntelligenceSwitchProduct")) {
        failures.push("price-intelligence.ts missing resolvePriceIntelligenceSwitchProduct");
      }
      if (!src.includes("loadCheapestLeaders")) {
        failures.push("price-intelligence.ts missing loadCheapestLeaders");
      }
      if (!src.includes("savePriceIntelligenceAutoSwitchPolicy")) {
        failures.push("price-intelligence.ts missing auto-switch policy save");
      }
    }

    if (rel === "lib/marketplace/price-intelligence-builders.ts") {
      if (!src.includes("buildPriceIntelligenceSnapshot")) {
        failures.push("price-intelligence-builders.ts missing buildPriceIntelligenceSnapshot");
      }
    }

    if (rel === "lib/marketplace/price-intelligence-policy.ts") {
      if (!src.includes("PRICE_INTELLIGENCE_POLICY_ID")) {
        failures.push("price-intelligence-policy.ts missing policy id");
      }
      if (!src.includes("PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT")) {
        failures.push("price-intelligence-policy.ts missing savings threshold");
      }
    }

    if (rel === "actions/marketplace/price-intelligence.ts") {
      if (!src.includes("togglePriceIntelligenceAutoSwitchAction")) {
        failures.push("price-intelligence action missing toggle auto-switch");
      }
      if (!src.includes("applyPriceIntelligenceAutoSwitchAction")) {
        failures.push("price-intelligence action missing apply auto-switch");
      }
      if (!src.includes("resolvePriceIntelligenceSwitchProduct")) {
        failures.push("price-intelligence action missing switch product resolver");
      }
    }

    if (rel === "app/dashboard/marketplace/price-intelligence/page.tsx") {
      if (!src.includes("PriceIntelligencePanel")) {
        failures.push("price-intelligence page missing PriceIntelligencePanel");
      }
      if (!src.includes("loadPriceIntelligenceSnapshot")) {
        failures.push("price-intelligence page missing loadPriceIntelligenceSnapshot");
      }
      if (!src.includes("Price Intelligence")) {
        failures.push("price-intelligence page missing title");
      }
    }

    if (rel === "components/marketplace/price-intelligence-panel.tsx") {
      if (!src.includes("price-intelligence-panel")) {
        failures.push("price-intelligence-panel.tsx missing root test id");
      }
      if (!src.includes("applyPriceIntelligenceAutoSwitchAction")) {
        failures.push("price-intelligence-panel.tsx missing apply switch action");
      }
      if (!src.includes("Auto-switch")) {
        failures.push("price-intelligence-panel.tsx missing auto-switch UI");
      }
      if (!src.includes("cheapestLeaders")) {
        failures.push("price-intelligence-panel.tsx missing cheapest supplier leaders");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePriceIntelligenceSmokeEra118ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PriceIntelligenceSmokeEra118ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPriceIntelligenceSmokeEra118Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PriceIntelligenceSmokeEra118Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePriceIntelligenceSmokeEra118ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PriceIntelligenceSmokeEra118Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PriceIntelligenceSmokeEra118Step[] = [
    {
      id: "wiring_audit",
      label: "Spend scan → cheapest supplier → switch recommendations → auto-switch",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 118 Price Intelligence cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: PRICE_INTELLIGENCE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: PRICE_INTELLIGENCE_ERA118_ROUTE,
    capabilities: PRICE_INTELLIGENCE_ERA118_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires marketplace PO history and multiple vendor SKUs per category.",
  };
}

export function formatPriceIntelligenceSmokeEra118ReportLines(
  summary: PriceIntelligenceSmokeEra118Summary,
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
