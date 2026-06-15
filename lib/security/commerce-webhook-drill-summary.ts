/**
 * Commerce webhook incident drill summary — Evolution Era 17 Cycle 21.
 */

import { COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID } from "@/lib/security/commerce-webhook-drill-era17-policy";

export const COMMERCE_WEBHOOK_DRILL_SUMMARY_VERSION = "era17-commerce-webhook-drill-v1" as const;

export const COMMERCE_WEBHOOK_INCIDENT_DRILL_STEPS = [
  {
    order: 1,
    action:
      "Triage failing commerce webhook — identify provider (Stripe/Woo/Shopify), route path, HTTP status, signature errors",
    owner: "Support + owner",
  },
  {
    order: 2,
    action:
      "Verify signature secret alignment — Stripe signing secret, Woo consumer secret, Shopify shared secret",
    owner: "Owner + integrations admin",
  },
  {
    order: 3,
    action:
      "Confirm webhook URL, TLS, and tenant mapping (shop domain / connection id) match integration settings",
    owner: "Integrations admin",
  },
  {
    order: 4,
    action:
      "Contain duplicate/replay storms — review ingress dedupe and webhook_event_store; pause high-volume retries if needed",
    owner: "Platform on-call",
  },
  {
    order: 5,
    action:
      "Validate invalid signature fail-closed — send test event with bad HMAC; expect 401/400 with no order side effects",
    owner: "Support + platform",
  },
  {
    order: 6,
    action:
      "Recovery — rotate secret or fix URL, re-enable connection, confirm one test order/event reaches order hub",
    owner: "Owner + support",
  },
] as const;

export type CommerceWebhookDrillStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type CommerceWebhookDrillMode = "tabletop" | "staging" | "unset";

export type CommerceWebhookDrillStep = {
  order: number;
  action: string;
  owner: string;
  status: CommerceWebhookDrillStepStatus;
  reason?: string;
};

export type CommerceWebhookDrillProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "proof_partial";

export type CommerceWebhookDrillSummary = {
  version: typeof COMMERCE_WEBHOOK_DRILL_SUMMARY_VERSION;
  policyId: typeof COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID;
  runAt: string;
  drillMode: CommerceWebhookDrillMode;
  commerceWebhookProofStatus: CommerceWebhookDrillProofStatus;
  stagingUrl: string | null;
  operatorEmail: string | null;
  incidentProvider: string | null;
  incidentSummary: string | null;
  postmortem: string | null;
  steps: CommerceWebhookDrillStep[];
  passedStepCount: number;
  totalSteps: number;
};

export type CommerceWebhookDrillInput = {
  drillMode?: CommerceWebhookDrillMode;
  stagingUrl?: string | null;
  operatorEmail?: string | null;
  incidentProvider?: string | null;
  incidentSummary?: string | null;
  postmortem?: string | null;
  stepStatuses?: Record<number, CommerceWebhookDrillStepStatus | undefined>;
};

export function parseCommerceWebhookDrillStepStatus(
  raw: string | undefined,
): CommerceWebhookDrillStepStatus | null {
  const value = raw?.trim().toUpperCase();
  if (value === "PASSED") return "PASSED";
  if (value === "FAILED") return "FAILED";
  if (value === "SKIPPED") return "SKIPPED";
  return null;
}

export function evaluateCommerceWebhookDrillPrerequisites(
  input: CommerceWebhookDrillInput,
): { ok: true } | { ok: false; reason: string } {
  if (!input.operatorEmail?.trim()) {
    return {
      ok: false,
      reason:
        "COMMERCE_WEBHOOK_DRILL_OPERATOR_EMAIL is not set — record drill facilitator before step sign-off.",
    };
  }
  if (input.drillMode === "staging" && !input.stagingUrl?.trim()) {
    return {
      ok: false,
      reason:
        "COMMERCE_WEBHOOK_DRILL_STAGING_URL is required when COMMERCE_WEBHOOK_DRILL_MODE=staging.",
    };
  }
  return { ok: true };
}

export function buildCommerceWebhookDrillSteps(
  input: CommerceWebhookDrillInput,
  prerequisitesOk: boolean,
  prerequisiteReason: string,
): CommerceWebhookDrillStep[] {
  return COMMERCE_WEBHOOK_INCIDENT_DRILL_STEPS.map((step) => {
    const statusFromInput = input.stepStatuses?.[step.order];
    if (statusFromInput) {
      return {
        order: step.order,
        action: step.action,
        owner: step.owner,
        status: statusFromInput,
        reason: `COMMERCE_WEBHOOK_DRILL_STEP_${step.order}_STATUS=${statusFromInput}`,
      };
    }
    if (!prerequisitesOk) {
      return {
        order: step.order,
        action: step.action,
        owner: step.owner,
        status: "SKIPPED",
        reason: prerequisiteReason,
      };
    }
    return {
      order: step.order,
      action: step.action,
      owner: step.owner,
      status: "SKIPPED",
      reason: `Set COMMERCE_WEBHOOK_DRILL_STEP_${step.order}_STATUS=PASSED|FAILED after drill step`,
    };
  });
}

export function resolveCommerceWebhookDrillProofStatus(
  steps: readonly CommerceWebhookDrillStep[],
): CommerceWebhookDrillProofStatus {
  if (steps.some((step) => step.status === "FAILED")) return "proof_failed";
  const passed = steps.filter((step) => step.status === "PASSED").length;
  if (passed === 0) return "proof_skipped_missing_prerequisites";
  if (passed === steps.length) return "proof_passed";
  return "proof_partial";
}

export function buildCommerceWebhookDrillSummary(
  input: CommerceWebhookDrillInput,
  runAt: Date = new Date(),
): CommerceWebhookDrillSummary {
  const prereq = evaluateCommerceWebhookDrillPrerequisites(input);
  const steps = buildCommerceWebhookDrillSteps(
    input,
    prereq.ok,
    prereq.ok ? "" : prereq.reason,
  );
  const passedStepCount = steps.filter((step) => step.status === "PASSED").length;

  return {
    version: COMMERCE_WEBHOOK_DRILL_SUMMARY_VERSION,
    policyId: COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID,
    runAt: runAt.toISOString(),
    drillMode: input.drillMode ?? "unset",
    commerceWebhookProofStatus: resolveCommerceWebhookDrillProofStatus(steps),
    stagingUrl: input.stagingUrl?.trim() || null,
    operatorEmail: input.operatorEmail?.trim() || null,
    incidentProvider: input.incidentProvider?.trim() || null,
    incidentSummary: input.incidentSummary?.trim() || null,
    postmortem: input.postmortem?.trim() || null,
    steps,
    passedStepCount,
    totalSteps: steps.length,
  };
}

export function formatCommerceWebhookDrillReportLines(
  summary: CommerceWebhookDrillSummary,
): string[] {
  return [
    `Commerce webhook drill (${summary.version}) — proof: ${summary.commerceWebhookProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Drill mode: ${summary.drillMode}`,
    `Operator: ${summary.operatorEmail ?? "not recorded"}`,
    `Incident provider: ${summary.incidentProvider ?? "not recorded"}`,
    `Steps passed: ${summary.passedStepCount}/${summary.totalSteps}`,
    "",
    ...summary.steps.map((step) =>
      step.status === "SKIPPED"
        ? `[SKIPPED WITH REASON] Step ${step.order} — ${step.action}: ${step.reason ?? "skipped"}`
        : `[${step.status}] Step ${step.order} — ${step.action} (${step.owner})`,
    ),
  ];
}

export function buildCommerceWebhookDrillInputFromEnv(): CommerceWebhookDrillInput {
  const modeRaw = process.env.COMMERCE_WEBHOOK_DRILL_MODE?.trim().toLowerCase();
  const drillMode: CommerceWebhookDrillMode =
    modeRaw === "staging" ? "staging" : modeRaw === "tabletop" ? "tabletop" : "unset";

  const stepStatuses: Record<number, CommerceWebhookDrillStepStatus | undefined> = {};
  for (let order = 1; order <= COMMERCE_WEBHOOK_INCIDENT_DRILL_STEPS.length; order += 1) {
    const parsed = parseCommerceWebhookDrillStepStatus(
      process.env[`COMMERCE_WEBHOOK_DRILL_STEP_${order}_STATUS`],
    );
    if (parsed) stepStatuses[order] = parsed;
  }

  return {
    drillMode,
    stagingUrl: process.env.COMMERCE_WEBHOOK_DRILL_STAGING_URL ?? null,
    operatorEmail: process.env.COMMERCE_WEBHOOK_DRILL_OPERATOR_EMAIL ?? null,
    incidentProvider: process.env.COMMERCE_WEBHOOK_DRILL_INCIDENT_PROVIDER ?? null,
    incidentSummary: process.env.COMMERCE_WEBHOOK_DRILL_INCIDENT_SUMMARY ?? null,
    postmortem: process.env.COMMERCE_WEBHOOK_DRILL_POSTMORTEM ?? null,
    stepStatuses,
  };
}
