import type { BusinessType } from "@prisma/client";

const SAFETY_PREAMBLE = `
You are KitchenOS Copilot, a concise foodservice operations assistant.

Operating constraints:
- You receive a redacted operational summary, never raw secrets, never raw PII.
- Do not invent numbers; only describe values that appear in the provided summary.
- Label projections / margins / forecasts as estimates.
- Do not make medical, dietary, allergen, or alcohol-compliance claims.
- Never instruct the user to disable security controls.
- Never produce direct database changes; if a change is needed, propose a draft action with a clear payload.
- Keep responses under 6 short sentences unless explicitly asked for detail.
- If the input is insufficient, say so plainly.

You are speaking to an operator inside their own workspace.
`.trim();

const MODE_HINTS: Partial<Record<BusinessType, string>> = {
  RESTAURANT: "Focus on service readiness, kitchen throughput, pickup / delivery on-time, and repeat customers.",
  CAFE: "Focus on morning rush, daily specials, pickup orders, and regulars.",
  BAR: "Focus on private events, drink / item sales, and staff task health. Avoid alcohol-compliance claims.",
  BAKERY: "Focus on preorders, batch production, pickup windows, and allergen-label coverage.",
  CATERING: "Focus on quote pipeline, accepted events, and load-out readiness.",
  MEAL_PREP: "Focus on recurring meal-plan revenue, packing accuracy, route on-time, and active subscribers.",
  GHOST_KITCHEN: "Focus on top brand by revenue, channel mix, production by brand, failed channel syncs.",
  CLOUD_KITCHEN: "Focus on multi-brand / channel risks and marketplace order flow.",
  MULTI_BRAND: "Focus on top brand by revenue, channel mix, production by brand, failed channel syncs.",
};

export function buildSystemPrompt(mode: BusinessType | null | undefined, role: string | null | undefined): string {
  const modeHint = mode ? MODE_HINTS[mode] ?? "" : "";
  const roleLine = role ? `Operator role: ${role}.` : "";
  return [SAFETY_PREAMBLE, roleLine, modeHint].filter(Boolean).join("\n\n");
}

export type NarrativePromptInput = {
  operatorRole: string | null;
  mode: BusinessType | null;
  rangeLabel: string;
  bulletSummary: string;
};

export function buildNarrativePrompt(input: NarrativePromptInput): string {
  return [
    `Operational summary for ${input.rangeLabel}.`,
    "Summarise the situation in <= 6 sentences and recommend up to 3 next actions for the operator.",
    "Do not introduce numbers or facts not present below.",
    "",
    input.bulletSummary,
  ].join("\n");
}

export type ChatPromptInput = {
  operatorRole: string | null;
  mode: BusinessType | null;
  contextSummary: string;
  userMessage: string;
  history: { role: "user" | "assistant"; content: string }[];
};

export function buildChatMessages(input: ChatPromptInput): {
  role: "system" | "user" | "assistant";
  content: string;
}[] {
  const system = buildSystemPrompt(input.mode, input.operatorRole);
  return [
    { role: "system" as const, content: system },
    {
      role: "user" as const,
      content: `Context summary (redacted, deterministic):\n\n${input.contextSummary}`,
    },
    ...input.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: input.userMessage },
  ];
}
