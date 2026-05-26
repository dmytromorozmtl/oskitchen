import type { CustomerSource, CustomerStatus, CustomerType } from "@prisma/client";

/**
 * Lightweight rule schema. Each rule is conjunctive ("all must match").
 * We keep this intentionally narrow — it covers the default segments and
 * stays JSON-serialisable for future UI editors.
 */
export type SegmentRule =
  | { kind: "status"; in: CustomerStatus[] }
  | { kind: "type"; in: CustomerType[] }
  | { kind: "source"; in: CustomerSource[] }
  | { kind: "lifetimeValueCentsAtLeast"; value: number }
  | { kind: "totalOrdersAtLeast"; value: number }
  | { kind: "lastOrderWithinDays"; value: number }
  | { kind: "lastOrderOlderThanDays"; value: number }
  | { kind: "hasAnyAllergy" }
  | { kind: "hasDietaryPreference" }
  | { kind: "marketingConsent"; value: boolean }
  | { kind: "tagIncludes"; value: string };

export type SegmentRules = { rules: SegmentRule[] };

export function isSegmentRules(value: unknown): value is SegmentRules {
  if (!value || typeof value !== "object") return false;
  const v = value as { rules?: unknown };
  return Array.isArray(v.rules);
}

export type BuiltInSegment = {
  key: string;
  name: string;
  description: string;
  color: string;
  rules: SegmentRule[];
};

export const BUILT_IN_SEGMENTS: readonly BuiltInSegment[] = [
  {
    key: "vip",
    name: "VIP",
    description: "High-value customers flagged VIP or with 5+ orders.",
    color: "#facc15",
    rules: [
      { kind: "status", in: ["VIP"] },
    ],
  },
  {
    key: "repeat-buyers",
    name: "Repeat buyers",
    description: "2 or more completed orders.",
    color: "#22c55e",
    rules: [
      { kind: "totalOrdersAtLeast", value: 2 },
    ],
  },
  {
    key: "new-customers",
    name: "New customers",
    description: "Status NEW or first order within the last 14 days.",
    color: "#38bdf8",
    rules: [
      { kind: "status", in: ["NEW"] },
    ],
  },
  {
    key: "at-risk",
    name: "At risk",
    description: "No order in the last 60 days, previously ordered at least once.",
    color: "#f97316",
    rules: [
      { kind: "lastOrderOlderThanDays", value: 60 },
      { kind: "totalOrdersAtLeast", value: 1 },
    ],
  },
  {
    key: "inactive",
    name: "Inactive",
    description: "No order in 180 days.",
    color: "#a3a3a3",
    rules: [
      { kind: "lastOrderOlderThanDays", value: 180 },
    ],
  },
  {
    key: "high-ltv",
    name: "High LTV",
    description: "Lifetime value ≥ $500.",
    color: "#a855f7",
    rules: [
      { kind: "lifetimeValueCentsAtLeast", value: 50000 },
    ],
  },
  {
    key: "catering-clients",
    name: "Catering clients",
    description: "Customers of type CATERING_CLIENT or sourced from a catering quote.",
    color: "#0ea5e9",
    rules: [
      { kind: "type", in: ["CATERING_CLIENT", "EVENT_CLIENT"] },
    ],
  },
  {
    key: "event-leads",
    name: "Event leads",
    description: "Sourced from event inquiry or bar event inquiry.",
    color: "#ec4899",
    rules: [
      { kind: "source", in: ["EVENT_INQUIRY", "BAR_EVENT_INQUIRY"] },
    ],
  },
  {
    key: "meal-plan",
    name: "Meal plan customers",
    description: "Customers tied to meal plans.",
    color: "#16a34a",
    rules: [
      { kind: "source", in: ["MEAL_PLAN"] },
    ],
  },
  {
    key: "allergy-sensitive",
    name: "Allergy-sensitive",
    description: "Any recorded allergy.",
    color: "#ef4444",
    rules: [
      { kind: "hasAnyAllergy" },
    ],
  },
  {
    key: "corporate-clients",
    name: "Corporate clients",
    description: "Type COMPANY / OFFICE_CLIENT / WHOLESALE_CLIENT.",
    color: "#6366f1",
    rules: [
      { kind: "type", in: ["COMPANY", "OFFICE_CLIENT", "WHOLESALE_CLIENT"] },
    ],
  },
  {
    key: "bakery-preorders",
    name: "Bakery preorders",
    description: "Customers from bakery preorder flow.",
    color: "#d97706",
    rules: [
      { kind: "source", in: ["BAKERY_PREORDER"] },
    ],
  },
  {
    key: "no-recent-order",
    name: "No recent order (90d)",
    description: "Last order older than 90 days.",
    color: "#64748b",
    rules: [
      { kind: "lastOrderOlderThanDays", value: 90 },
    ],
  },
  {
    key: "marketing-consented",
    name: "Marketing consented",
    description: "Customers with active email marketing consent.",
    color: "#10b981",
    rules: [
      { kind: "marketingConsent", value: true },
    ],
  },
];

/**
 * Pure evaluator — used both server-side (build memberships) and client-side
 * (preview a segment before saving).
 */
export type EvaluatableCustomer = {
  status: CustomerStatus;
  type: CustomerType;
  source: CustomerSource;
  lifetimeValueCents: number;
  totalOrders: number;
  lastOrderAt: Date | null;
  marketingConsent: boolean;
  allergies: readonly string[];
  dietary: readonly string[];
  tags: readonly string[];
};

export function evaluateSegment(rules: readonly SegmentRule[], customer: EvaluatableCustomer, now: Date = new Date()): boolean {
  for (const rule of rules) {
    if (!evaluateRule(rule, customer, now)) return false;
  }
  return true;
}

function evaluateRule(rule: SegmentRule, c: EvaluatableCustomer, now: Date): boolean {
  switch (rule.kind) {
    case "status": return rule.in.includes(c.status);
    case "type":   return rule.in.includes(c.type);
    case "source": return rule.in.includes(c.source);
    case "lifetimeValueCentsAtLeast": return c.lifetimeValueCents >= rule.value;
    case "totalOrdersAtLeast":         return c.totalOrders >= rule.value;
    case "lastOrderWithinDays":  return c.lastOrderAt != null && daysBetween(c.lastOrderAt, now) <= rule.value;
    case "lastOrderOlderThanDays":
      if (c.lastOrderAt == null) return false;
      return daysBetween(c.lastOrderAt, now) >= rule.value;
    case "hasAnyAllergy":         return c.allergies.length > 0;
    case "hasDietaryPreference":  return c.dietary.length > 0;
    case "marketingConsent":      return c.marketingConsent === rule.value;
    case "tagIncludes":           return c.tags.includes(rule.value);
  }
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
