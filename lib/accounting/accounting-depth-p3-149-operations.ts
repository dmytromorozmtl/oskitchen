import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditAccountantPortalWiring } from "@/lib/accounting/accountant-portal-audit";
import { auditApAutomationP2_104 } from "@/lib/accounting/ap-automation-p2-104-audit";
import { ACCOUNTING_DEPTH_P3_149_CAPABILITIES } from "@/lib/accounting/accounting-depth-p3-149-content";
import {
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT,
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS,
  ACCOUNTING_DEPTH_P3_149_COMPONENT,
  ACCOUNTING_DEPTH_P3_149_LEGACY_GL,
  ACCOUNTING_DEPTH_P3_149_LEGACY_PORTAL,
  ACCOUNTING_DEPTH_P3_149_PAGE,
  ACCOUNTING_DEPTH_P3_149_POLICY_ID,
  ACCOUNTING_DEPTH_P3_149_ROUTE,
  ACCOUNTING_DEPTH_P3_149_SECONDARY_REF,
} from "@/lib/accounting/accounting-depth-p3-149-policy";
import { auditChartOfAccountsMappingWiring } from "@/lib/accounting/chart-of-accounts-mapping-audit";
import { auditJournalEntryExportWiring } from "@/lib/accounting/journal-entry-export-audit";
import { auditPnlReconciliationViewWiring } from "@/lib/accounting/pnl-reconciliation-view-audit";

export type AccountingDepthCapabilityRecord = {
  id: string;
  label: string;
  route: string;
  testId: string;
  status: string;
};

export type AccountingDepthR365Registry = {
  version: string;
  policyId: typeof ACCOUNTING_DEPTH_P3_149_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  secondaryRef: string;
  capabilityCount: number;
  route: string;
  activePilotCount: number;
  capabilities: AccountingDepthCapabilityRecord[];
};

export function loadAccountingDepthR365Registry(
  root = process.cwd(),
  artifactPath = "artifacts/accounting-depth-r365-registry.json",
): AccountingDepthR365Registry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as AccountingDepthR365Registry;
}

export function validateAccountingDepthR365Registry(registry: AccountingDepthR365Registry): {
  valid: boolean;
  policyIdMatches: boolean;
  capabilitiesComplete: boolean;
  zeroActivePilots: boolean;
} {
  const policyIdMatches = registry.policyId === ACCOUNTING_DEPTH_P3_149_POLICY_ID;

  const capabilitiesComplete =
    registry.capabilityCount === ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT &&
    registry.route === ACCOUNTING_DEPTH_P3_149_ROUTE &&
    registry.secondaryRef === ACCOUNTING_DEPTH_P3_149_SECONDARY_REF &&
    registry.capabilities.length === ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS.length &&
    ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS.every((capabilityId, index) => {
      const record = registry.capabilities[index];
      const expected = ACCOUNTING_DEPTH_P3_149_CAPABILITIES[index];
      return (
        record?.id === capabilityId &&
        record.testId === expected?.testId &&
        record.route === expected?.route &&
        (record.status === "shipped" || record.status === "BETA")
      );
    });

  const zeroActivePilots = registry.activePilotCount === 0;

  const valid = policyIdMatches && capabilitiesComplete && zeroActivePilots;

  return {
    valid,
    policyIdMatches,
    capabilitiesComplete,
    zeroActivePilots,
  };
}

export function checkAccountingDepthCoaAudit(root = process.cwd()): boolean {
  return auditChartOfAccountsMappingWiring(root).ok;
}

export function checkAccountingDepthJournalAudit(root = process.cwd()): boolean {
  return auditJournalEntryExportWiring(root).ok;
}

export function checkAccountingDepthPortalAudit(root = process.cwd()): boolean {
  return auditAccountantPortalWiring(root).ok;
}

export function checkAccountingDepthReconciliationAudit(root = process.cwd()): boolean {
  return auditPnlReconciliationViewWiring(root).ok;
}

export function checkAccountingDepthApAudit(root = process.cwd()): boolean {
  return auditApAutomationP2_104(root).passed;
}

export function checkAccountingDepthLegacyGlWiring(root = process.cwd()): boolean {
  const glPath = join(root, ACCOUNTING_DEPTH_P3_149_LEGACY_GL);
  const portalPath = join(root, ACCOUNTING_DEPTH_P3_149_LEGACY_PORTAL);

  if (!existsSync(glPath) || !existsSync(portalPath)) {
    return false;
  }

  const glSource = readFileSync(glPath, "utf8");
  const portalSource = readFileSync(portalPath, "utf8");

  return (
    glSource.includes("buildJournalEntriesFromPnlLines") &&
    glSource.includes("gl-depth-accounting-absolute-final-v1") &&
    portalSource.includes("periodCloseReady") &&
    portalSource.includes("accountant-portal-absolute-final-v1")
  );
}

export function checkAccountingDepthLiveWiring(root = process.cwd()): boolean {
  const componentPath = join(root, ACCOUNTING_DEPTH_P3_149_COMPONENT);
  const pagePath = join(root, ACCOUNTING_DEPTH_P3_149_PAGE);

  if (!existsSync(componentPath) || !existsSync(pagePath)) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  const componentWired =
    componentSource.includes("AccountingDepthPanel") &&
    componentSource.includes("accounting-depth-r365") &&
    ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS.every((id) => componentSource.includes(id));

  const pageWired =
    pageSource.includes("AccountingDepthPanel") &&
    pageSource.includes(ACCOUNTING_DEPTH_P3_149_ROUTE);

  return componentWired && pageWired;
}
