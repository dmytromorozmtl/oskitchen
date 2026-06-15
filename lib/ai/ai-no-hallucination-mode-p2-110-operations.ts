/**
 * Pure helpers for AI no hallucination mode (Blueprint P2-110).
 */

import { AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID } from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";

export type AiClaimVerdict = "pass" | "blocked" | "needs_source";

export type AiNoHallucinationCheckResult = {
  id: string;
  claim: string;
  verdict: AiClaimVerdict;
  reason: string | null;
  sourceReference: string | null;
  tenantScoped: boolean;
};

export type AiNoHallucinationModeReport = {
  policyId: typeof AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID;
  checkCount: number;
  passCount: number;
  blockedCount: number;
  needsSourceCount: number;
  modeEnabled: boolean;
  checks: AiNoHallucinationCheckResult[];
};

const UNSUPPORTED_CLAIM_PATTERNS = [
  /\bguaranteed\b/i,
  /\bcertified\b/i,
  /\balways\b/i,
  /\bnever fails\b/i,
  /\b100%\s+accurate\b/i,
  /\bindustry[- ]leading\b/i,
  /\bmarket[- ]dominat/i,
] as const;

const ALLOWED_TENANT_SOURCE_TYPES = [
  "order",
  "invoice",
  "ingredient",
  "product",
  "inventory",
  "copilot_draft",
  "forecast",
  "labor",
  "customer",
] as const;

export type TenantSourceRef = {
  sourceType: string;
  sourceId: string;
  workspaceId: string;
};

export function detectUnsupportedClaim(text: string): { blocked: boolean; pattern: string | null } {
  for (const pattern of UNSUPPORTED_CLAIM_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, pattern: pattern.source };
    }
  }
  return { blocked: false, pattern: null };
}

export function validateTenantDataScope(
  source: TenantSourceRef,
  tenantWorkspaceId: string,
): boolean {
  if (!source.workspaceId || source.workspaceId !== tenantWorkspaceId) {
    return false;
  }
  return ALLOWED_TENANT_SOURCE_TYPES.includes(
    source.sourceType as (typeof ALLOWED_TENANT_SOURCE_TYPES)[number],
  );
}

export function validateSourceBackedClaim(input: {
  claim: string;
  sourceType?: string | null;
  sourceId?: string | null;
}): { backed: boolean; reference: string | null } {
  if (!input.sourceType || !input.sourceId) {
    return { backed: false, reference: null };
  }
  const reference = `${input.sourceType}:${input.sourceId}`;
  return { backed: reference.includes(":") && input.sourceId.length > 0, reference };
}

export function evaluateNoHallucinationClaim(input: {
  id: string;
  claim: string;
  sourceType?: string | null;
  sourceId?: string | null;
  workspaceId: string;
  tenantWorkspaceId: string;
}): AiNoHallucinationCheckResult {
  const unsupported = detectUnsupportedClaim(input.claim);
  if (unsupported.blocked) {
    return {
      id: input.id,
      claim: input.claim,
      verdict: "blocked",
      reason: `Unsupported claim pattern: ${unsupported.pattern}`,
      sourceReference: null,
      tenantScoped: false,
    };
  }

  const source = validateSourceBackedClaim({
    claim: input.claim,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
  });

  if (!source.backed) {
    return {
      id: input.id,
      claim: input.claim,
      verdict: "needs_source",
      reason: "Claim requires sourceType:sourceId reference",
      sourceReference: null,
      tenantScoped: false,
    };
  }

  const tenantScoped = validateTenantDataScope(
    {
      sourceType: input.sourceType!,
      sourceId: input.sourceId!,
      workspaceId: input.workspaceId,
    },
    input.tenantWorkspaceId,
  );

  if (!tenantScoped) {
    return {
      id: input.id,
      claim: input.claim,
      verdict: "blocked",
      reason: "Source not scoped to tenant workspace",
      sourceReference: source.reference,
      tenantScoped: false,
    };
  }

  return {
    id: input.id,
    claim: input.claim,
    verdict: "pass",
    reason: null,
    sourceReference: source.reference,
    tenantScoped: true,
  };
}

export const AI_NO_HALLUCINATION_DEMO_INPUTS = [
  {
    id: "claim-001",
    claim: "Yesterday +12% order volume vs prior week",
    sourceType: "order",
    sourceId: "ord-week-42",
    workspaceId: "ws-demo-001",
  },
  {
    id: "claim-002",
    claim: "Chicken breast par level reached — 12 lb on hand",
    sourceType: "inventory",
    sourceId: "ing-chicken",
    workspaceId: "ws-demo-001",
  },
  {
    id: "claim-003",
    claim: "Guaranteed 100% accurate invoice OCR on all suppliers",
    sourceType: null,
    sourceId: null,
    workspaceId: "ws-demo-001",
  },
  {
    id: "claim-006",
    claim: "Prep list updated for tomorrow service",
    sourceType: null,
    sourceId: null,
    workspaceId: "ws-demo-001",
  },
  {
    id: "claim-004",
    claim: "DoorDash commission spike detected — 18% vs 12% avg",
    sourceType: "order",
    sourceId: "channel-doordash",
    workspaceId: "ws-demo-001",
  },
  {
    id: "claim-005",
    claim: "Industry-leading food cost optimization",
    sourceType: "product",
    sourceId: "prod-fries",
    workspaceId: "ws-other-tenant",
  },
] as const;

export function buildNoHallucinationModeReport(input: {
  checks: AiNoHallucinationCheckResult[];
  modeEnabled?: boolean;
}): AiNoHallucinationModeReport {
  return {
    policyId: AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
    checkCount: input.checks.length,
    passCount: input.checks.filter((c) => c.verdict === "pass").length,
    blockedCount: input.checks.filter((c) => c.verdict === "blocked").length,
    needsSourceCount: input.checks.filter((c) => c.verdict === "needs_source").length,
    modeEnabled: input.modeEnabled ?? true,
    checks: input.checks,
  };
}

export function buildNoHallucinationModeDemoReport(): AiNoHallucinationModeReport {
  const tenantWorkspaceId = "ws-demo-001";
  const checks = AI_NO_HALLUCINATION_DEMO_INPUTS.map((input) =>
    evaluateNoHallucinationClaim({ ...input, tenantWorkspaceId }),
  );
  return buildNoHallucinationModeReport({ checks, modeEnabled: true });
}

export function isNoHallucinationModeCompliant(report: AiNoHallucinationModeReport): boolean {
  return report.blockedCount === 0 && report.needsSourceCount === 0;
}
