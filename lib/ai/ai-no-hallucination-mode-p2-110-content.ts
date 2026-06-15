import {
  AI_NO_HALLUCINATION_MODE_P2_110_APPROVAL_ROUTE,
  AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT,
  AI_NO_HALLUCINATION_MODE_P2_110_ROUTE,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";

export const AI_NO_HALLUCINATION_MODE_P2_110_EYEBROW =
  "No hallucination mode · source-backed AI" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_HEADLINE =
  "Tenant data only, source-backed claims, and no unsupported statements" as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_SUBLINE =
  "Three guardrails — AI outputs must cite tenant-scoped records, every claim links to a source reference, and unsupported superlatives are blocked before display. BETA: verify against your data — typical directional trust signals, not certified compliance audit." as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES = [
  {
    id: "tenant-data-only",
    label: "Tenant data only",
    description: "Responses scoped to workspace orders, inventory, invoices, and labor — no cross-tenant or external fabrications.",
    module: "services/ai/copilot-service.ts",
    route: AI_NO_HALLUCINATION_MODE_P2_110_ROUTE,
  },
  {
    id: "source-backed",
    label: "Source-backed",
    description: "Every AI claim must include sourceType:sourceId reference from tenant records.",
    module: "lib/ai/ai-confidence-labels-p2-107-operations.ts",
    route: "/dashboard/ai/confidence-labels",
  },
  {
    id: "no-unsupported-claims",
    label: "No unsupported claims",
    description: "Blocks guaranteed, certified, always, and other superlatives without evidence.",
    module: "lib/ai/copilot-guardrails.ts",
    route: AI_NO_HALLUCINATION_MODE_P2_110_ROUTE,
  },
] as const;

export const AI_NO_HALLUCINATION_MODE_P2_110_OPERATOR_LINKS = [
  { label: "Approval workflow", href: AI_NO_HALLUCINATION_MODE_P2_110_APPROVAL_ROUTE },
  { label: "Confidence labels", href: "/dashboard/ai/confidence-labels" },
  { label: "AI honesty policy", href: "/docs/ai-honesty-policy.md" },
] as const;

export { AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT, AI_NO_HALLUCINATION_MODE_P2_110_ROUTE };
