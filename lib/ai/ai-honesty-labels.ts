/**
 * AI module honesty labels — sync with docs/ai-honesty-policy.md and ai-moats-honest-positioning.md
 * @see docs/ai-honesty-policy.md
 */

export const AI_HONESTY_POLICY_ID = "ai-honesty-policy-v1" as const;

export type AiModuleId =
  | "restaurant-brain"
  | "digital-twin"
  | "universal-menu"
  | "food-cost-ai"
  | "ai-purchasing"
  | "kitchen-camera"
  | "invoice-scanner"
  | "benchmark-network"
  | "operations-copilot"
  | "restaurant-co-pilot";

export type AiMaturityLabel = "pilot_ready" | "beta" | "preview";

export type AiMethodLabel =
  | "deterministic"
  | "heuristic"
  | "simulation"
  | "llm_optional"
  | "synthetic_default";

export type AiHonestyLabelDefinition = {
  moduleId: AiModuleId;
  moduleName: string;
  maturity: AiMaturityLabel;
  method: AiMethodLabel;
  methodDescription: string;
  disclaimer: string;
  routes: readonly string[];
};

export const AI_METHOD_LABELS: Record<AiMethodLabel, string> = {
  deterministic: "Deterministic — rules + your workspace data",
  heuristic: "Heuristic — threshold alerts from ops signals",
  simulation: "Simulation — planning model, not live telemetry",
  llm_optional: "Optional LLM — verify before acting",
  synthetic_default: "Preview default — synthetic until stream configured",
};

export const AI_MATURITY_LABELS: Record<AiMaturityLabel, string> = {
  pilot_ready: "Pilot ready",
  beta: "BETA",
  preview: "Preview",
};

/** Seven proprietary modules + copilot surfaces (policy § Scope). */
export const AI_HONESTY_LABELS: readonly AiHonestyLabelDefinition[] = [
  {
    moduleId: "restaurant-brain",
    moduleName: "AI Restaurant Brain",
    maturity: "pilot_ready",
    method: "deterministic",
    methodDescription: AI_METHOD_LABELS.deterministic,
    disclaimer:
      "Daily briefing from hub, KDS, and inventory signals — not an autonomous manager. Review before acting.",
    routes: ["/dashboard/today"],
  },
  {
    moduleId: "digital-twin",
    moduleName: "Digital Twin",
    maturity: "beta",
    method: "simulation",
    methodDescription: AI_METHOD_LABELS.simulation,
    disclaimer:
      "Station load simulation for planning — not a real-time mirror of your physical kitchen layout.",
    routes: ["/dashboard/analytics/digital-twin"],
  },
  {
    moduleId: "universal-menu",
    moduleName: "Universal Menu Engine",
    maturity: "beta",
    method: "deterministic",
    methodDescription: "Cross-channel menu model — sync maturity follows each integration's BETA/LIVE status",
    disclaimer:
      "Channel sync depends on partner credentials and Integration Health — not guaranteed bidirectional inventory.",
    routes: ["/dashboard/menu/universal"],
  },
  {
    moduleId: "food-cost-ai",
    moduleName: "Food Cost AI",
    maturity: "pilot_ready",
    method: "deterministic",
    methodDescription: AI_METHOD_LABELS.deterministic,
    disclaimer:
      "Recipe-based margins require accurate yields and receiving data — not tax or audit advice.",
    routes: ["/dashboard/analytics/food-cost"],
  },
  {
    moduleId: "ai-purchasing",
    moduleName: "AI Purchasing",
    maturity: "beta",
    method: "deterministic",
    methodDescription: "EOQ-style reorder math — human approves every purchase order",
    disclaimer:
      "Recommendations only — buyer approves POs. Not autonomous procurement or vendor negotiation.",
    routes: ["/dashboard/inventory/purchasing-ai"],
  },
  {
    moduleId: "kitchen-camera",
    moduleName: "Kitchen Camera AI",
    maturity: "beta",
    method: "synthetic_default",
    methodDescription: AI_METHOD_LABELS.synthetic_default,
    disclaimer:
      "Camera-ready platform with configurable detection modules — not food safety certification or live vision on all stations by default.",
    routes: ["/dashboard/kitchen/cameras", "/dashboard/kitchen/cameras/live"],
  },
  {
    moduleId: "invoice-scanner",
    moduleName: "AI Invoice Scanner",
    maturity: "beta",
    method: "llm_optional",
    methodDescription: AI_METHOD_LABELS.llm_optional,
    disclaimer:
      "AI-assisted invoice scanning. Please verify all fields before confirming. Confidence scores are estimates, not guarantees.",
    routes: ["/dashboard/inventory/invoice-scanner"],
  },
  {
    moduleId: "benchmark-network",
    moduleName: "Benchmark Network",
    maturity: "beta",
    method: "heuristic",
    methodDescription: "Anonymized cohort comparisons when sample size allows",
    disclaimer:
      "Early deployments may show limited benchmarks — not third-party audited industry rankings.",
    routes: ["/dashboard/analytics/benchmarks"],
  },
  {
    moduleId: "operations-copilot",
    moduleName: "AI Operations Copilot",
    maturity: "preview",
    method: "llm_optional",
    methodDescription: AI_METHOD_LABELS.llm_optional,
    disclaimer:
      "Deterministic insights by default; optional narrative when OPENAI_API_KEY is configured. Human approval on drafts.",
    routes: [
      "/dashboard/copilot",
      "/dashboard/copilot/chat",
      "/dashboard/copilot/insights",
      "/dashboard/copilot/drafts",
    ],
  },
  {
    moduleId: "restaurant-co-pilot",
    moduleName: "AI Restaurant Co-Pilot",
    maturity: "preview",
    method: "heuristic",
    methodDescription: "Purchasing, labor, and margin scans — approval draft before execute",
    disclaimer:
      "Scans operational gaps and surfaces drafts — nothing runs until you approve and execute.",
    routes: ["/dashboard/ai/co-pilot", "/dashboard/ai/co-pilot/autonomous"],
  },
] as const;

export function getAiHonestyLabel(moduleId: AiModuleId): AiHonestyLabelDefinition {
  const label = AI_HONESTY_LABELS.find((entry) => entry.moduleId === moduleId);
  if (!label) {
    throw new Error(`Unknown AI module: ${moduleId}`);
  }
  return label;
}

export function getAiHonestyLabelForRoute(pathname: string): AiHonestyLabelDefinition | null {
  const normalized = pathname.split("?")[0]?.replace(/\/$/, "") || pathname;
  for (const entry of AI_HONESTY_LABELS) {
    if (entry.routes.some((route) => normalized === route || normalized.startsWith(`${route}/`))) {
      return entry;
    }
  }
  return null;
}

export function listAiHonestyModuleIds(): AiModuleId[] {
  return AI_HONESTY_LABELS.map((entry) => entry.moduleId);
}
