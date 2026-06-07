/**
 * Absolute Final Task 44 — KDS station routing rules (NCR Aloha parity).
 */

import {
  DEFAULT_KDS_STATIONS,
  KDS_CATEGORY_FOOD_TYPE_MAP,
  type KdsFoodType,
} from "@/lib/kitchen/kds-multi-station-policy";

export const KDS_STATION_ROUTING_RULES_POLICY_ID =
  "kds-station-routing-rules-absolute-final-v1" as const;

export const KDS_STATION_ROUTING_RULES_ROUTE = "/dashboard/kitchen/routing-rules" as const;

export const KDS_STATION_ROUTING_RULES_PANEL_PATH =
  "components/dashboard/kitchen/kds-station-routing-rules-panel.tsx" as const;

export const KDS_STATION_ROUTING_RULES_SERVICE_PATH =
  "services/kitchen/kds-station-routing-rules-service.ts" as const;

export const KDS_STATION_ROUTING_RULES_STORAGE_KEY = "kdsStationRoutingRules" as const;

export const KDS_STATION_ROUTING_RULES_CI_SCRIPTS = ["test:ci:kds-station-routing-rules"] as const;

export type KdsRoutingRuleKind = "product" | "category" | "keyword" | "default";

export type KdsStationRoutingRule = {
  id: string;
  kind: KdsRoutingRuleKind;
  match: string;
  stationName: string;
  priority: number;
  enabled: boolean;
  label: string;
};

export type KdsRoutingRuleMatchReason = "rule_product" | "rule_category" | "rule_keyword" | "rule_default";

export type KdsStationRoutingRulesConfig = {
  rules: KdsStationRoutingRule[];
  version: 1;
};

export const DEFAULT_KDS_STATION_ROUTING_RULES: KdsStationRoutingRule[] = [
  {
    id: "cat-mains-grill",
    kind: "category",
    match: "MAINS",
    stationName: "Grill",
    priority: 10,
    enabled: true,
    label: "Entrées → Grill",
  },
  {
    id: "cat-sides-fry",
    kind: "category",
    match: "SIDES",
    stationName: "Fry",
    priority: 11,
    enabled: true,
    label: "Sides → Fry",
  },
  {
    id: "cat-bakery",
    kind: "category",
    match: "BAKERY",
    stationName: "Bakery",
    priority: 12,
    enabled: true,
    label: "Bakery → Bakery",
  },
  {
    id: "cat-beverages-bar",
    kind: "category",
    match: "BEVERAGES",
    stationName: "Bar & Beverage",
    priority: 13,
    enabled: true,
    label: "Beverages → Bar",
  },
  {
    id: "cat-desserts",
    kind: "category",
    match: "DESSERTS",
    stationName: "Dessert",
    priority: 14,
    enabled: true,
    label: "Desserts → Dessert",
  },
  {
    id: "kw-pizza",
    kind: "keyword",
    match: "pizza",
    stationName: "Pizza",
    priority: 20,
    enabled: true,
    label: "Title contains pizza → Pizza",
  },
  {
    id: "kw-sushi",
    kind: "keyword",
    match: "sushi",
    stationName: "Sushi",
    priority: 21,
    enabled: true,
    label: "Title contains sushi → Sushi",
  },
  {
    id: "kw-salad",
    kind: "keyword",
    match: "salad",
    stationName: "Salad & Cold",
    priority: 22,
    enabled: true,
    label: "Title contains salad → Cold",
  },
  {
    id: "default-prep",
    kind: "default",
    match: "*",
    stationName: "Prep",
    priority: 999,
    enabled: true,
    label: "Fallback → Prep",
  },
];

export function mergeKdsStationRoutingRules(
  custom: readonly KdsStationRoutingRule[] | null | undefined,
): KdsStationRoutingRule[] {
  if (!custom?.length) return [...DEFAULT_KDS_STATION_ROUTING_RULES];

  const byId = new Map(DEFAULT_KDS_STATION_ROUTING_RULES.map((rule) => [rule.id, { ...rule }]));
  for (const rule of custom) {
    byId.set(rule.id, { ...rule });
  }

  return [...byId.values()].sort((a, b) => a.priority - b.priority);
}

export type RoutingRuleWorkItem = {
  id: string;
  title: string;
  productId?: string | null;
  productCategory?: string | null;
};

export function evaluateKdsStationRoutingRules(
  item: RoutingRuleWorkItem,
  rules: readonly KdsStationRoutingRule[],
): { stationName: string; ruleId: string; reason: KdsRoutingRuleMatchReason } | null {
  const active = rules.filter((rule) => rule.enabled).sort((a, b) => a.priority - b.priority);

  if (item.productId) {
    const productRule = active.find(
      (rule) => rule.kind === "product" && rule.match === item.productId,
    );
    if (productRule) {
      return {
        stationName: productRule.stationName,
        ruleId: productRule.id,
        reason: "rule_product",
      };
    }
  }

  const category = item.productCategory?.trim().toUpperCase();
  if (category) {
    const categoryRule = active.find(
      (rule) => rule.kind === "category" && rule.match.toUpperCase() === category,
    );
    if (categoryRule) {
      return {
        stationName: categoryRule.stationName,
        ruleId: categoryRule.id,
        reason: "rule_category",
      };
    }
  }

  const title = item.title.toLowerCase();
  const keywordRule = active.find(
    (rule) =>
      rule.kind === "keyword" && title.includes(rule.match.trim().toLowerCase()),
  );
  if (keywordRule) {
    return {
      stationName: keywordRule.stationName,
      ruleId: keywordRule.id,
      reason: "rule_keyword",
    };
  }

  const defaultRule = active.find((rule) => rule.kind === "default");
  if (defaultRule) {
    return {
      stationName: defaultRule.stationName,
      ruleId: defaultRule.id,
      reason: "rule_default",
    };
  }

  return null;
}

export function foodTypeForCategory(category: string | null | undefined): KdsFoodType {
  const key = category?.trim().toUpperCase() ?? "OTHER";
  return KDS_CATEGORY_FOOD_TYPE_MAP[key] ?? "prep";
}

export function stationNamesFromRegistry(): string[] {
  return DEFAULT_KDS_STATIONS.map((station) => station.name);
}

export function parseKdsStationRoutingRulesConfig(raw: unknown): KdsStationRoutingRulesConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { version: 1, rules: [...DEFAULT_KDS_STATION_ROUTING_RULES] };
  }

  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.rules)) {
    return { version: 1, rules: [...DEFAULT_KDS_STATION_ROUTING_RULES] };
  }

  const rules: KdsStationRoutingRule[] = [];
  for (const entry of o.rules) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const r = entry as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.stationName !== "string") continue;
    rules.push({
      id: r.id,
      kind:
        r.kind === "product" || r.kind === "category" || r.kind === "keyword" || r.kind === "default"
          ? r.kind
          : "keyword",
      match: typeof r.match === "string" ? r.match : "",
      stationName: r.stationName,
      priority: Number(r.priority ?? 100),
      enabled: r.enabled !== false,
      label: typeof r.label === "string" ? r.label : r.stationName,
    });
  }

  return { version: 1, rules: mergeKdsStationRoutingRules(rules) };
}
