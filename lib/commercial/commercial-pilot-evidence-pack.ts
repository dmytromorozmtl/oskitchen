import {
  COMMERCIAL_PILOT_EVIDENCE_ERA16_FORBIDDEN_CLAIMS,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES,
  type CommercialPilotEvidenceRole,
} from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import { COMMERCIAL_PILOT_TIER0_CI_COMMANDS } from "@/lib/commercial/commercial-pilot-runbook-policy";

export type CommercialPilotChecklistItem = {
  id: string;
  task: string;
  verifyHow: string;
  /** When true, failure blocks a GO decision. */
  goBlocker: boolean;
};

export type CommercialPilotRoleChecklist = {
  role: CommercialPilotEvidenceRole;
  title: string;
  durationMinutes: number;
  items: readonly CommercialPilotChecklistItem[];
};

export type CommercialPilotAllowedFeature = {
  id: string;
  feature: string;
  maturity: "live" | "pilot_ready" | "beta" | "preview" | "qualified";
  salesWording: string;
  policyRefs: readonly string[];
};

export type CommercialPilotSupportBoundary = {
  id: string;
  inScope: string;
  outOfScope: string;
};

export type CommercialPilotEscalationTier = {
  severity: "P0" | "P1" | "P2";
  examples: readonly string[];
  responseTarget: string;
  owner: string;
};

export type CommercialPilotRollbackStep = {
  order: number;
  action: string;
  owner: string;
};

export type CommercialPilotGoNoGoInput = {
  tier0Pass: boolean;
  tier1Pass: boolean;
  tier2Pass: boolean;
  tier3Pass?: boolean;
  roleChecklistsComplete: boolean;
  forbiddenClaimsInContract: boolean;
  icpQualified?: boolean;
  stagingUrl?: string | null;
  commitSha?: string | null;
};

export type CommercialPilotGoNoGoResult = {
  decision: "GO" | "NO-GO" | "CONDITIONAL";
  blockers: string[];
  warnings: string[];
};

export const COMMERCIAL_PILOT_ROLE_CHECKLISTS: readonly CommercialPilotRoleChecklist[] = [
  {
    role: "owner",
    title: "Workspace owner",
    durationMinutes: 45,
    items: [
      {
        id: "owner-auth",
        task: "Sign in, complete onboarding, invite at least one manager",
        verifyHow: "Staff invite accepted; owner sees dashboard Today",
        goBlocker: true,
      },
      {
        id: "owner-catalog",
        task: "Create menu + products; confirm kitchen settings",
        verifyHow: "Products visible in order creation and storefront admin",
        goBlocker: true,
      },
      {
        id: "owner-storefront",
        task: "Publish storefront menu; run pay-later checkout test",
        verifyHow: "Order appears in order hub; Tier 3 cert or manual PASS",
        goBlocker: true,
      },
      {
        id: "owner-integrations",
        task: "Connect Woo **or** Shopify test shop (optional)",
        verifyHow: "`npm run smoke:channel-golden-path` PASS; live smoke SKIPPED/FAILED documented",
        goBlocker: false,
      },
      {
        id: "owner-billing",
        task: "Confirm plan/entitlements match contract",
        verifyHow: "Billing page shows expected plan; no surprise feature gates",
        goBlocker: true,
      },
      {
        id: "owner-matrix",
        task: "Review feature maturity matrix for contract features",
        verifyHow: "Each promised feature is `live`, `pilot_ready`, or `beta` with qualified wording",
        goBlocker: true,
      },
    ],
  },
  {
    role: "manager",
    title: "Manager / ops lead",
    durationMinutes: 30,
    items: [
      {
        id: "manager-orders",
        task: "Create manual order → production → packing path",
        verifyHow: "Order status transitions; workspace scope enforced",
        goBlocker: true,
      },
      {
        id: "manager-rbac",
        task: "Verify manager can access ops modules; cannot access owner-only billing",
        verifyHow: "Permission deny on billing.manage; order hub scoped",
        goBlocker: true,
      },
      {
        id: "manager-production",
        task: "Use production board / calendar for one prep day",
        verifyHow: "`npm run smoke:production-calendar` or manual PASS on staging",
        goBlocker: false,
      },
      {
        id: "manager-reports",
        task: "Open executive/operations reports allowed for manager role",
        verifyHow: "Reports load; export denied without reports.read.* grants",
        goBlocker: false,
      },
    ],
  },
  {
    role: "cashier",
    title: "Cashier / POS operator",
    durationMinutes: 20,
    items: [
      {
        id: "cashier-pos-open",
        task: "Open register + shift; run cash checkout",
        verifyHow: "Receipt generated; shift records sale; inventory depletes on POS path only",
        goBlocker: true,
      },
      {
        id: "cashier-rbac-deny",
        task: "Confirm cashier cannot access settings, billing, or integrations",
        verifyHow: "Nav hidden or permission denied with audit",
        goBlocker: true,
      },
      {
        id: "cashier-refund",
        task: "Manager performs refund/void spot check (cashier may be denied)",
        verifyHow: "Refund requires manager permission; audit log present",
        goBlocker: false,
      },
    ],
  },
  {
    role: "kitchen",
    title: "Kitchen / expo staff",
    durationMinutes: 20,
    items: [
      {
        id: "kitchen-kds",
        task: "Bump and recall tickets on KDS daily service",
        verifyHow: "`npm run smoke:kds-staging` PASS or manual staging sign-off",
        goBlocker: false,
      },
      {
        id: "kitchen-scope",
        task: "Kitchen staff see only kitchen/production modules",
        verifyHow: "kitchen.view / kitchen.bump permissions; no billing access",
        goBlocker: true,
      },
      {
        id: "kitchen-inventory-truth",
        task: "Confirm storefront orders do **not** deplete POS inventory",
        verifyHow: "Document POS-only depletion policy with operator",
        goBlocker: true,
      },
    ],
  },
  {
    role: "support_admin",
    title: "Support / platform admin (internal)",
    durationMinutes: 15,
    items: [
      {
        id: "support-impersonation",
        task: "Platform support uses impersonation with MFA — not founder email bypass",
        verifyHow: "Impersonation audit log; MFA required",
        goBlocker: true,
      },
      {
        id: "support-tickets",
        task: "Pilot tenant visible in support tooling; ticket triage works",
        verifyHow: "Create test ticket; workspace scope correct",
        goBlocker: false,
      },
      {
        id: "support-claims",
        task: "Sales contract reviewed against forbidden claims list",
        verifyHow: "`MARKETING_CLAIMS_STRICT=1 npm run verify-claims` PASS",
        goBlocker: true,
      },
      {
        id: "support-webhooks",
        task: "Webhook security matrix reviewed for commerce routes",
        verifyHow: "`npm run test:ci:webhook-security-era16:cert` PASS",
        goBlocker: false,
      },
    ],
  },
] as const;

export const COMMERCIAL_PILOT_ALLOWED_FEATURES: readonly CommercialPilotAllowedFeature[] = [
  {
    id: "auth-email",
    feature: "Email/password auth and staff invites",
    maturity: "live",
    salesWording: "Staff can sign in with email/password and workspace invites",
    policyRefs: ["era13-enterprise-identity-recert-v1"],
  },
  {
    id: "orders-spine",
    feature: "Manual orders, order hub, production, packing",
    maturity: "pilot_ready",
    salesWording: "Core order-to-fulfillment workflow for paid pilots",
    policyRefs: ["era4-order-spine-v1"],
  },
  {
    id: "storefront-checkout",
    feature: "Storefront publish + pay-later checkout",
    maturity: "pilot_ready",
    salesWording: "Online ordering with qualified checkout maturity",
    policyRefs: ["era7-storefront-stripe-secrets-accept-v1"],
  },
  {
    id: "pos-cash",
    feature: "POS terminal cash checkout (software path)",
    maturity: "beta",
    salesWording: "In-browser POS — qualified; no hardware/offline certification",
    policyRefs: ["era4-tier2b-optional-v1", "era5-pos-e2e-secrets-accept-v1"],
  },
  {
    id: "kds-smoke",
    feature: "KDS daily service bump/recall",
    maturity: "qualified",
    salesWording: "Kitchen display for operational smoke — not rush-hour certified",
    policyRefs: ["era15-kds-staging-smoke-recert-v1"],
  },
  {
    id: "production-calendar",
    feature: "Production calendar / board",
    maturity: "pilot_ready",
    salesWording: "Prep scheduling with qualified operator depth",
    policyRefs: ["era15-production-calendar-operator-recert-v1"],
  },
  {
    id: "woo-shopify",
    feature: "WooCommerce / Shopify golden path",
    maturity: "qualified",
    salesWording: "Test-shop integration path — not full marketplace live ops",
    policyRefs: ["era16-channel-live-smoke-v1", "era14-channel-golden-path-recert-v1"],
  },
  {
    id: "inventory-pos-only",
    feature: "Inventory depletion on POS checkout only",
    maturity: "qualified",
    salesWording: "Inventory policy must be explained — storefront/API do not deplete stock",
    policyRefs: ["era4-pos-only-v1", "era5-pos-only-gtm-lock-v1"],
  },
  {
    id: "rewards-dual-ledger",
    feature: "Gift cards / loyalty (dual ledger)",
    maturity: "qualified",
    salesWording: "Rewards are channel-specific — not unified cross-channel balance",
    policyRefs: ["era14-cross-channel-rewards-recert-v1"],
  },
  {
    id: "sso-pilot",
    feature: "SSO pilot (optional, activated tenants only)",
    maturity: "preview",
    salesWording: "Enterprise SSO pilot wiring — not production SSO for all tenants",
    policyRefs: ["era16-enterprise-sso-r2-admin-v1"],
  },
] as const;

export const COMMERCIAL_PILOT_SUPPORT_BOUNDARIES: readonly CommercialPilotSupportBoundary[] = [
  {
    id: "config",
    inScope: "Workspace setup, menu/catalog, storefront publish, test-shop integrations",
    outOfScope: "Custom feature development, marketplace live ops, hardware POS deployment",
  },
  {
    id: "security",
    inScope: "RBAC configuration guidance, audit export, webhook signature verification review",
    outOfScope: "SOC 2 attestation, pen test execution, custom IdP production cutover without pilot plan",
  },
  {
    id: "data",
    inScope: "Tenant-scoped data export per contract; rollback assistance",
    outOfScope: "Cross-tenant data access except audited platform support impersonation",
  },
  {
    id: "hours",
    inScope: "Business-hours pilot support per contract SLA",
    outOfScope: "24/7 rush-hour KDS or marketplace on-call unless separately contracted",
  },
] as const;

export const COMMERCIAL_PILOT_ROLLBACK_STEPS: readonly CommercialPilotRollbackStep[] = [
  {
    order: 1,
    action: "Disable storefront publish / set blackout window",
    owner: "Owner + support",
  },
  {
    order: 2,
    action: "Pause Woo/Shopify webhooks at provider; revoke API keys in dashboard",
    owner: "Owner",
  },
  {
    order: 3,
    action: "Document open orders; complete or cancel in-flight production/packing",
    owner: "Manager",
  },
  {
    order: 4,
    action: "Export audit log + order snapshot if contract requires",
    owner: "Support admin",
  },
  {
    order: 5,
    action: "Disable staff invites; retain owner access for read-only wind-down",
    owner: "Owner",
  },
  {
    order: 6,
    action: "Record rollback date, reason, and commit SHA in pilot tracker",
    owner: "Support admin",
  },
] as const;

export const COMMERCIAL_PILOT_ESCALATION_TIERS: readonly CommercialPilotEscalationTier[] = [
  {
    severity: "P0",
    examples: [
      "Cross-tenant data visible",
      "Payment webhook processing down",
      "Auth bypass or privilege escalation",
    ],
    responseTarget: "1 hour acknowledge; same-day mitigation plan",
    owner: "Platform on-call + founder",
  },
  {
    severity: "P1",
    examples: [
      "Order creation blocked for all staff",
      "Storefront checkout failure rate spike",
      "KDS completely unavailable during service",
    ],
    responseTarget: "4 business hours acknowledge",
    owner: "Support lead + engineering",
  },
  {
    severity: "P2",
    examples: [
      "Single-module UX defect",
      "Report export formatting",
      "Non-blocking integration sync delay",
    ],
    responseTarget: "Next business day triage",
    owner: "Support queue",
  },
] as const;

export function getCommercialPilotRoleChecklist(
  role: CommercialPilotEvidenceRole,
): CommercialPilotRoleChecklist | undefined {
  return COMMERCIAL_PILOT_ROLE_CHECKLISTS.find((c) => c.role === role);
}

export function evaluateCommercialPilotGoNoGo(
  input: CommercialPilotGoNoGoInput,
): CommercialPilotGoNoGoResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.tier0Pass) blockers.push("Tier 0 engineering CI gate failed");
  if (!input.tier1Pass) blockers.push("Tier 1 staging environment readiness failed");
  if (!input.tier2Pass) blockers.push("Tier 2 operator golden path incomplete");
  if (!input.roleChecklistsComplete) blockers.push("One or more role checklists incomplete");
  if (input.forbiddenClaimsInContract) {
    blockers.push("Contract or marketing copy contains forbidden pilot claims");
  }
  if (input.icpQualified === false) {
    blockers.push("Prospect fails Era 17 pilot ICP qualification (era17-pilot-icp-contract-v1)");
  }
  if (!input.stagingUrl?.trim()) warnings.push("Staging URL not recorded in evidence pack");
  if (!input.commitSha?.trim()) warnings.push("Release commit SHA not recorded");
  if (input.tier3Pass === false) {
    warnings.push("Tier 3 money-path smoke not passed — rely on Tier 0 certs or re-run");
  }

  if (blockers.length > 0) {
    return { decision: "NO-GO", blockers, warnings };
  }
  if (warnings.length > 0) {
    return { decision: "CONDITIONAL", blockers, warnings };
  }
  return { decision: "GO", blockers, warnings };
}

export function buildCommercialPilotEvidencePackSummary(policyId: string) {
  const goBlockerCount = COMMERCIAL_PILOT_ROLE_CHECKLISTS.flatMap((r) => r.items).filter(
    (i) => i.goBlocker,
  ).length;

  return {
    policyId,
    generatedAt: new Date().toISOString(),
    roles: COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES,
    roleChecklistCount: COMMERCIAL_PILOT_ROLE_CHECKLISTS.length,
    goBlockerItemCount: goBlockerCount,
    allowedFeatureCount: COMMERCIAL_PILOT_ALLOWED_FEATURES.length,
    forbiddenClaimCount: COMMERCIAL_PILOT_EVIDENCE_ERA16_FORBIDDEN_CLAIMS.length,
    supportBoundaryCount: COMMERCIAL_PILOT_SUPPORT_BOUNDARIES.length,
    rollbackStepCount: COMMERCIAL_PILOT_ROLLBACK_STEPS.length,
    escalationTierCount: COMMERCIAL_PILOT_ESCALATION_TIERS.length,
    tier0Commands: [...COMMERCIAL_PILOT_TIER0_CI_COMMANDS],
    allowedFeatures: COMMERCIAL_PILOT_ALLOWED_FEATURES.map((f) => ({
      id: f.id,
      feature: f.feature,
      maturity: f.maturity,
    })),
    forbiddenClaims: [...COMMERCIAL_PILOT_EVIDENCE_ERA16_FORBIDDEN_CLAIMS],
  };
}

export function validateCommercialPilotEvidencePackStructure(): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const role of COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES) {
    const checklist = getCommercialPilotRoleChecklist(role);
    if (!checklist) errors.push(`Missing checklist for role: ${role}`);
    else if (checklist.items.length === 0) errors.push(`Empty checklist for role: ${role}`);
  }

  if (COMMERCIAL_PILOT_ALLOWED_FEATURES.length < 5) {
    errors.push("Allowed features list too short — expected at least 5 pilot features");
  }

  if (COMMERCIAL_PILOT_ROLLBACK_STEPS.length < 3) {
    errors.push("Rollback plan must have at least 3 steps");
  }

  return { ok: errors.length === 0, errors };
}
