/**
 * POS-only inventory lock recert summary — Evolution Era 17 Cycle 29.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_HOOK_SYMBOLS,
  POS_ONLY_INVENTORY_LOCK_ERA17_NON_DEPLETING_ENTRYPOINTS,
  POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID,
  POS_ONLY_INVENTORY_LOCK_ERA17_POS_DEPLETION_ENTRYPOINTS,
  POS_ONLY_INVENTORY_LOCK_ERA17_STOREFRONT_HOOK_STATUS,
} from "@/lib/inventory/pos-only-inventory-lock-era17-policy";
import {
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  INVENTORY_DEPLETION_POLICY_ID,
} from "@/lib/inventory/inventory-depletion-policy";

export const POS_ONLY_INVENTORY_LOCK_SUMMARY_VERSION =
  "era17-pos-only-inventory-lock-v1" as const;

export type PosOnlyInventoryLockScanResult = {
  path: string;
  role: "pos_depletion" | "non_depleting";
  ok: boolean;
  violations: string[];
};

export type PosOnlyInventoryLockProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_cert_failed";

export type PosOnlyInventoryLockSummary = {
  version: typeof POS_ONLY_INVENTORY_LOCK_SUMMARY_VERSION;
  policyId: typeof POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID;
  runAt: string;
  certPassed: boolean;
  lockProofStatus: PosOnlyInventoryLockProofStatus;
  extendsPolicies: readonly string[];
  storefrontHookStatus: typeof POS_ONLY_INVENTORY_LOCK_ERA17_STOREFRONT_HOOK_STATUS;
  posDepletionEntrypoints: readonly string[];
  nonDepletingEntrypoints: readonly string[];
  scanResults: PosOnlyInventoryLockScanResult[];
  violationCount: number;
};

function scanEntrypoint(
  root: string,
  rel: string,
  role: PosOnlyInventoryLockScanResult["role"],
): PosOnlyInventoryLockScanResult {
  const path = join(root, rel);
  let source: string;
  try {
    source = readFileSync(path, "utf8");
  } catch {
    return {
      path: rel,
      role,
      ok: false,
      violations: ["file missing"],
    };
  }

  const violations: string[] = [];

  if (role === "pos_depletion") {
    const hasHook = POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_HOOK_SYMBOLS.some((symbol) =>
      source.includes(symbol),
    );
    if (!hasHook) {
      violations.push("expected POS depletion hook missing from certified entrypoint");
    }
  } else {
    for (const symbol of POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_HOOK_SYMBOLS) {
      if (source.includes(symbol)) {
        violations.push(`forbidden symbol: ${symbol}`);
      }
    }
  }

  return {
    path: rel,
    role,
    ok: violations.length === 0,
    violations,
  };
}

export function scanPosOnlyInventoryLockEntrypoints(
  root: string = process.cwd(),
): PosOnlyInventoryLockScanResult[] {
  const posScans = POS_ONLY_INVENTORY_LOCK_ERA17_POS_DEPLETION_ENTRYPOINTS.map((rel) =>
    scanEntrypoint(root, rel, "pos_depletion"),
  );
  const nonScans = POS_ONLY_INVENTORY_LOCK_ERA17_NON_DEPLETING_ENTRYPOINTS.map((rel) =>
    scanEntrypoint(root, rel, "non_depleting"),
  );
  return [...posScans, ...nonScans];
}

export function resolvePosOnlyInventoryLockProofStatus(input: {
  certPassed: boolean;
  scanResults: readonly PosOnlyInventoryLockScanResult[];
}): PosOnlyInventoryLockProofStatus {
  if (!input.certPassed) return "proof_skipped_cert_failed";
  if (input.scanResults.some((result) => !result.ok)) return "proof_failed";
  return "proof_passed";
}

export function buildPosOnlyInventoryLockSummary(input: {
  certPassed: boolean;
  scanResults?: readonly PosOnlyInventoryLockScanResult[];
  root?: string;
  runAt?: Date;
}): PosOnlyInventoryLockSummary {
  const scanResults =
    input.scanResults ?? scanPosOnlyInventoryLockEntrypoints(input.root ?? process.cwd());
  const violationCount = scanResults.reduce((sum, result) => sum + result.violations.length, 0);

  return {
    version: POS_ONLY_INVENTORY_LOCK_SUMMARY_VERSION,
    policyId: POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID,
    runAt: (input.runAt ?? new Date()).toISOString(),
    certPassed: input.certPassed,
    lockProofStatus: resolvePosOnlyInventoryLockProofStatus({
      certPassed: input.certPassed,
      scanResults,
    }),
    extendsPolicies: [INVENTORY_DEPLETION_POLICY_ID, INVENTORY_DEPLETION_GTM_LOCK_ID],
    storefrontHookStatus: POS_ONLY_INVENTORY_LOCK_ERA17_STOREFRONT_HOOK_STATUS,
    posDepletionEntrypoints: POS_ONLY_INVENTORY_LOCK_ERA17_POS_DEPLETION_ENTRYPOINTS,
    nonDepletingEntrypoints: POS_ONLY_INVENTORY_LOCK_ERA17_NON_DEPLETING_ENTRYPOINTS,
    scanResults: [...scanResults],
    violationCount,
  };
}

export function formatPosOnlyInventoryLockReportLines(
  summary: PosOnlyInventoryLockSummary,
): string[] {
  return [
    `POS-only inventory lock (${summary.version}) — proof: ${summary.lockProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Cert passed: ${summary.certPassed}`,
    `Storefront hook: ${summary.storefrontHookStatus}`,
    `Scan violations: ${summary.violationCount}`,
    "",
    ...summary.scanResults.map((result) =>
      result.ok
        ? `[OK] ${result.path} (${result.role})`
        : `[FAILED] ${result.path} (${result.role}): ${result.violations.join("; ")}`,
    ),
  ];
}
