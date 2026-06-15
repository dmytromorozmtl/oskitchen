import {
  AI_CONFIDENCE_LABELS_P2_107_ACTION_DRAFTS_ROUTE,
  AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT,
  AI_CONFIDENCE_LABELS_P2_107_ROUTE,
} from "@/lib/ai/ai-confidence-labels-p2-107-policy";

export const AI_CONFIDENCE_LABELS_P2_107_EYEBROW =
  "AI confidence labels · high / medium / low" as const;

export const AI_CONFIDENCE_LABELS_P2_107_HEADLINE =
  "Confidence tiers, Needs approval gate, and source references on AI outputs" as const;

export const AI_CONFIDENCE_LABELS_P2_107_SUBLINE =
  "Three label dimensions — high/medium/low confidence tiers, Needs approval for low-trust outputs, and source references linking back to tenant data. BETA: verify labels against underlying data — typical directional trust signals, not certified accuracy audit." as const;

export const AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES = [
  {
    id: "confidence-tier",
    label: "Confidence tier",
    description: "High (≥90%), Medium (70–89%), Low (<70%) — unified across AI modules.",
    module: "lib/ai/ai-confidence-labels-p2-107-operations.ts",
    route: AI_CONFIDENCE_LABELS_P2_107_ROUTE,
  },
  {
    id: "needs-approval",
    label: "Needs approval",
    description: "Low confidence or action drafts require human approval before execution.",
    module: "services/ai/copilot-service.ts",
    route: AI_CONFIDENCE_LABELS_P2_107_ACTION_DRAFTS_ROUTE,
  },
  {
    id: "source-references",
    label: "Source references",
    description: "Link AI output to source records — invoice, order, ingredient, forecast row.",
    module: "lib/ai/ai-honesty-labels.ts",
    route: AI_CONFIDENCE_LABELS_P2_107_ROUTE,
  },
] as const;

export const AI_CONFIDENCE_LABELS_P2_107_OPERATOR_LINKS = [
  { label: "Action drafts", href: AI_CONFIDENCE_LABELS_P2_107_ACTION_DRAFTS_ROUTE },
  { label: "Invoice scanner", href: "/dashboard/inventory/invoice-scanner" },
  { label: "AI honesty policy", href: "/docs/ai-honesty-policy.md" },
] as const;

export { AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT, AI_CONFIDENCE_LABELS_P2_107_ROUTE };
