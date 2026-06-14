import type { DeterministicSnapshot } from "@/lib/ai/deterministic-insights-from-overview";

export type CopilotQaAnswer = {
  answer: string;
  grounded: boolean;
  sourceTypes: string[];
};

const HALLUCINATION_PATTERNS = [
  /\bguaranteed\b/i,
  /\bcertified\b/i,
  /\b100%\s+accurate\b/i,
  /\bindustry[- ]leading\b/i,
  /\bnever fails\b/i,
] as const;

type IntentRule = {
  patterns: RegExp[];
  types: string[];
};

const RESTAURANT_QA_INTENTS: IntentRule[] = [
  { patterns: [/integration|channel|shopify|doordash|sync/i], types: ["failed_integrations"] },
  { patterns: [/production|prep board|behind schedule/i], types: ["production_overdue"] },
  { patterns: [/pack|packing|accuracy/i], types: ["packing_accuracy_low"] },
  { patterns: [/deliver|route|driver/i], types: ["failed_delivery_stops"] },
  { patterns: [/inventory|stock|shortage|ingredient/i], types: ["inventory_shortage_upcoming", "inventory_shortage"] },
  { patterns: [/purchas|vendor|po\b/i], types: ["purchasing_open"] },
  { patterns: [/order|throughput|sales|rush|ticket/i], types: ["throughput_today"] },
  { patterns: [/catering|quote|event/i], types: ["catering_followup_overdue"] },
  { patterns: [/meal plan|subscriber|cycle/i], types: ["meal_plan_cycles_missing"] },
  { patterns: [/task|overdue/i], types: ["overdue_tasks"] },
  { patterns: [/margin|food cost|costing/i], types: ["low_margin_item"] },
  { patterns: [/repeat|retention|loyal|crm/i], types: ["low_repeat_rate"] },
];

export function answerCopilotQuestionFromSnapshot(
  question: string,
  snapshot: DeterministicSnapshot,
): CopilotQaAnswer {
  const normalized = question.trim().toLowerCase();

  for (const intent of RESTAURANT_QA_INTENTS) {
    if (!intent.patterns.some((pattern) => pattern.test(normalized))) continue;
    for (const type of intent.types) {
      const insight = snapshot.insights.find((item) => item.type === type);
      if (!insight) continue;
      const action = insight.recommendedAction ? ` Next: ${insight.recommendedAction}` : "";
      return {
        answer: `${insight.title}: ${insight.summary}${action}`,
        grounded: true,
        sourceTypes: [insight.type],
      };
    }
  }

  return {
    answer: [
      "I only answer from scoped workspace signals — here is what I can verify:",
      "",
      snapshot.bulletSummary,
      "",
      `Your question: ${question.trim()}`,
    ].join("\n"),
    grounded: true,
    sourceTypes: [],
  };
}

export function detectCopilotAnswerHallucination(answer: string): boolean {
  return HALLUCINATION_PATTERNS.some((pattern) => pattern.test(answer));
}
