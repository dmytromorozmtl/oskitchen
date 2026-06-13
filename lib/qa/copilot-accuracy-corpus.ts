/**
 * Golden co-pilot Q&A corpus for P1-13 accuracy benchmark (20 questions, no live LLM in CI).
 */

export type CopilotAccuracyFixture = {
  id: string;
  question: string;
  contextSummary: string;
  expectedKeywords: string[];
  forbiddenPatterns: RegExp[];
};

const GLOBAL_FORBIDDEN: RegExp[] = [
  /\bguaranteed\b/i,
  /\bcertified accurate\b/i,
  /\bfda approved\b/i,
  /\ballergen-free\b/i,
  /\b100% safe\b/i,
];

const QUESTION_BANK: Omit<CopilotAccuracyFixture, "id">[] = [
  {
    question: "How many orders are active right now?",
    contextSummary:
      "Range: Today\n• Today's throughput: 18 orders in Today, 2 cancelled.\n• Channel integration needs attention: 1 integration connection not currently active.",
    expectedKeywords: ["18 orders", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Do we have any failed integrations?",
    contextSummary:
      "Range: Today\n• Channel integration needs attention: 3 integration connections not currently active.\n• Failed delivery stops: 2 stops marked as failed.",
    expectedKeywords: ["3 integration", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "What is our packing accuracy today?",
    contextSummary:
      "Range: Today\n• Packing accuracy below target: Pack-through rate is 82.5%.\n• Today's throughput: 42 orders in Today, 0 cancelled.",
    expectedKeywords: ["82.5%", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Are any production items overdue?",
    contextSummary:
      "Range: Today\n• Production items behind schedule: 7 production items not yet completed.\n• Today's throughput: 11 orders in Today, 1 cancelled.",
    expectedKeywords: ["7 production", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Summarize inventory shortages.",
    contextSummary:
      "Range: Today\n• Ingredient shortages open: 4 ingredient lines short.\n• Today's throughput: 6 orders in Today, 0 cancelled.",
    expectedKeywords: ["4 ingredient", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Any imminent ingredient shortages before production?",
    contextSummary:
      "Range: Today\n• Ingredient shortages before production date: 2 ingredients short within 3 days.\n• Production items behind schedule: 1 production item not yet completed.",
    expectedKeywords: ["2 ingredient", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "How many delivery stops failed?",
    contextSummary:
      "Range: Today\n• Failed delivery stops: 5 stops marked as failed.\n• Today's throughput: 29 orders in Today, 3 cancelled.",
    expectedKeywords: ["5 stop", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "What should I check on margins?",
    contextSummary:
      "Range: This week\n• Margin pressure: Review pricing on: Margherita Flatbread, Chicken Bowl, Veggie Wrap.\n• Today's throughput: 55 orders in This week, 4 cancelled.",
    expectedKeywords: ["Margherita", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Give me a forecast disclaimer for today.",
    contextSummary:
      "Range: Today\n• Forecast disclaimer: Forecast is indicative only — verify against live prep counts.\n• Today's throughput: 9 orders in Today, 0 cancelled.",
    expectedKeywords: ["indicative", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Is webhook backlog clear?",
    contextSummary:
      "Range: Today\n• Webhook attention: 6 recent webhook rows still unprocessed — check Sales channels.\n• Today's throughput: 33 orders in Today, 1 cancelled.",
    expectedKeywords: ["6 recent webhook", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Can you guarantee tomorrow's revenue?",
    contextSummary:
      "Range: Today\n• Forecast disclaimer: Forecast is indicative only.\n• Today's throughput: 21 orders in Today, 2 cancelled.",
    expectedKeywords: ["indicative", "deterministic"],
    forbiddenPatterns: [...GLOBAL_FORBIDDEN, /\bguarantee\b/i],
  },
  {
    question: "Is this dish allergen-free for celiac guests?",
    contextSummary:
      "Range: Today\n• Today's throughput: 14 orders in Today, 0 cancelled.\n• Packing accuracy below target: Pack-through rate is 88.0%.",
    expectedKeywords: ["deterministic", "Question asked"],
    forbiddenPatterns: [...GLOBAL_FORBIDDEN, /\ballergen-free\b/i, /\bcertified\b/i],
  },
  {
    question: "How many orders were cancelled today?",
    contextSummary:
      "Range: Today\n• Today's throughput: 27 orders in Today, 5 cancelled.\n• Failed delivery stops: 1 stop marked as failed.",
    expectedKeywords: ["5 cancelled", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "What integrations need re-authentication?",
    contextSummary:
      "Range: Today\n• Channel integration needs attention: 2 integration connections not currently active.\n• Webhook attention: 1 recent webhook rows still unprocessed.",
    expectedKeywords: ["2 integration", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Should I reprioritize production board?",
    contextSummary:
      "Range: Today\n• Production items behind schedule: 12 production items not yet completed.\n• Ingredient shortages open: 1 ingredient line short.",
    expectedKeywords: ["12 production", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "What's our order throughput this week?",
    contextSummary:
      "Range: This week\n• Today's throughput: 214 orders in This week, 11 cancelled.\n• Margin pressure: Review pricing on: Family Platter.",
    expectedKeywords: ["214 orders", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Any critical blockers for kitchen ops?",
    contextSummary:
      "Range: Today\n• Channel integration needs attention: 4 integration connections not currently active.\n• Production items behind schedule: 9 production items not yet completed.\n• Ingredient shortages before production date: 3 ingredients short within 3 days.",
    expectedKeywords: ["4 integration", "9 production", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Where should I go to fix packing exceptions?",
    contextSummary:
      "Range: Today\n• Packing accuracy below target: Pack-through rate is 76.2%.\n• Recommended: Review packing exceptions before the next wave.",
    expectedKeywords: ["76.2%", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Do we have low-margin items to review?",
    contextSummary:
      "Range: This week\n• Margin pressure: Review pricing on: Tuna Poke, Caesar Salad, Iced Latte, Brownie Bite.\n• Today's throughput: 88 orders in This week, 2 cancelled.",
    expectedKeywords: ["Tuna Poke", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
  {
    question: "Quick ops summary for shift handoff.",
    contextSummary:
      "Range: Today\n• Today's throughput: 36 orders in Today, 1 cancelled.\n• Failed delivery stops: 3 stops marked as failed.\n• Webhook attention: 2 recent webhook rows still unprocessed.",
    expectedKeywords: ["36 orders", "3 stop", "deterministic"],
    forbiddenPatterns: GLOBAL_FORBIDDEN,
  },
];

/** 20 co-pilot questions with deterministic ground-truth keyword expectations. */
export function buildCopilotAccuracyCorpus(): CopilotAccuracyFixture[] {
  return QUESTION_BANK.map((fixture, index) => ({
    id: `copilot-q-${String(index + 1).padStart(2, "0")}`,
    ...fixture,
  }));
}
