/**
 * Era 20 — surfaces live vs example ICP qualification for GO/NO-GO without faking customers.
 */

import {
  ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_ENV_VAR,
  ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_POLICY_ID,
  ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH,
  ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_TEMPLATE_PATH,
} from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20-policy";
import { ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_DISCLAIMER } from "@/lib/commercial/era20-first-paid-pilot-package-policy";
import type { PilotGoNoGoEvidenceGate } from "@/lib/commercial/pilot-gono-go-summary";
import { parsePilotIcpInputFromJson } from "@/lib/commercial/pilot-gono-go-summary";
import {
  evaluatePilotIcpQualification,
  formatPilotIcpQualificationReport,
  type PilotIcpQualificationInput,
  type PilotIcpQualificationResult,
} from "@/lib/commercial/pilot-icp-contract-era17";

export const ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT: PilotIcpQualificationInput = {
  singleOrSmallMultiUnit: true,
  ownerOperatorEngaged: true,
  needsCoreKitchenOrderPath: true,
  acceptsQualifiedBetaLabels: true,
  requiresProductionSso: false,
  requiresSoc2OrScim: false,
  requiresUnifiedInventory: false,
  requiresUnifiedRewards: false,
  requiresRushHourKdsSla: false,
  requiresMarketplaceLiveOps: false,
  requiresOfflinePosOrHardwareParity: false,
  requiresPublicApiSla: false,
  refusesQualifiedWording: false,
};

export const ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_LABEL =
  "Example Ghost Kitchen (prospect template)" as const;

export type Era20PilotIcpQualificationBridgeSlice = {
  policyId: typeof ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_POLICY_ID;
  headline: string;
  envConfigured: boolean;
  envVarName: typeof ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_ENV_VAR;
  templatePath: typeof ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_TEMPLATE_PATH;
  prospectDraftTemplatePath: typeof ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH;
  setupCommand: string;
  liveQualification: PilotIcpQualificationResult;
  exampleQualification: PilotIcpQualificationResult;
  exampleLabel: typeof ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_LABEL;
  prospectDisclaimer: string;
  liveReportLine: string;
  exampleReportLine: string;
  gonoGoIcpGatePass: boolean;
};

export function isPilotIcpEnvConfigured(icpEnvRaw: string | undefined): boolean {
  return Boolean(icpEnvRaw?.trim());
}

export function buildEra20PilotIcpQualificationBridgeSlice(input: {
  icpEnvRaw?: string | undefined;
}): Era20PilotIcpQualificationBridgeSlice {
  const envConfigured = isPilotIcpEnvConfigured(input.icpEnvRaw);
  const liveInput = parsePilotIcpInputFromJson(input.icpEnvRaw);
  const liveQualification = evaluatePilotIcpQualification(liveInput);
  const exampleQualification = evaluatePilotIcpQualification(ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT);

  const setupCommand =
    "export " +
    ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_ENV_VAR +
    '="$(cat ' +
    ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_TEMPLATE_PATH +
    ')"';

  let headline =
    "Qualify real prospects with PILOT_GONOGO_ICP_INPUT_JSON — example template is NOT a signed customer.";
  if (!envConfigured) {
    headline =
      "ICP env not set — GO/NO-GO treats prospect as NOT QUALIFIED until sales exports real prospect JSON.";
  } else if (liveQualification.qualified) {
    headline = "Live ICP input qualifies — re-run smoke:pilot-gono-go; customer/LOI gates still required.";
  } else {
    headline =
      "Live ICP input NOT QUALIFIED — remediate disqualifiers before paid pilot; do not inflate GO/NO-GO.";
  }

  return {
    policyId: ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_POLICY_ID,
    headline,
    envConfigured,
    envVarName: ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_ENV_VAR,
    templatePath: ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_TEMPLATE_PATH,
    prospectDraftTemplatePath: ERA20_PILOT_ICP_PROSPECT_DRAFT_TEMPLATE_PATH,
    setupCommand,
    liveQualification,
    exampleQualification,
    exampleLabel: ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_LABEL,
    prospectDisclaimer: ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_DISCLAIMER,
    liveReportLine: formatPilotIcpQualificationReport(liveQualification),
    exampleReportLine: formatPilotIcpQualificationReport(exampleQualification),
    gonoGoIcpGatePass: envConfigured && liveQualification.qualified,
  };
}

export function derivePilotIcpQualificationGate(input: {
  icpEnvRaw?: string | undefined;
}): PilotGoNoGoEvidenceGate {
  const bridge = buildEra20PilotIcpQualificationBridgeSlice(input);
  const pass = bridge.gonoGoIcpGatePass;

  if (!bridge.envConfigured) {
    return {
      id: "icp_qualification",
      label: "ICP qualification (PILOT_GONOGO_ICP_INPUT_JSON)",
      pass: false,
      reason:
        "ICP env not configured — set PILOT_GONOGO_ICP_INPUT_JSON from real prospect review (template is example only)",
    };
  }

  if (pass) {
    return {
      id: "icp_qualification",
      label: "ICP qualification (PILOT_GONOGO_ICP_INPUT_JSON)",
      pass: true,
      reason: "Prospect matches Era 17 paid pilot ICP — does not satisfy customer/LOI gate",
    };
  }

  const parts: string[] = [];
  if (bridge.liveQualification.disqualifiers.length > 0) {
    parts.push(`Disqualifiers: ${bridge.liveQualification.disqualifiers.join("; ")}`);
  }
  if (bridge.liveQualification.missingCriteria.length > 0) {
    parts.push(`Missing: ${bridge.liveQualification.missingCriteria.join("; ")}`);
  }

  return {
    id: "icp_qualification",
    label: "ICP qualification (PILOT_GONOGO_ICP_INPUT_JSON)",
    pass: false,
    reason:
      parts.length > 0
        ? parts.join(" — ")
        : "Prospect fails Era 17 pilot ICP qualification (era17-pilot-icp-contract-v1)",
  };
}

export function buildPilotIcpQualificationGoNoGoWarning(
  bridge: Era20PilotIcpQualificationBridgeSlice,
): string | null {
  if (!bridge.envConfigured) {
    return `ICP env empty — example ${bridge.exampleLabel} would qualify for tabletop only; ${bridge.prospectDisclaimer}`;
  }
  if (!bridge.liveQualification.qualified) {
    return `Live ICP NOT QUALIFIED — ${bridge.liveReportLine}`;
  }
  return null;
}
