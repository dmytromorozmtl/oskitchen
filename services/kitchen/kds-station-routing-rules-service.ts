import {
  DEFAULT_KDS_STATION_ROUTING_RULES,
  evaluateKdsStationRoutingRules,
  KDS_STATION_ROUTING_RULES_POLICY_ID,
  type KdsStationRoutingRule,
} from "@/lib/kitchen/kds-station-routing-rules-policy";
import { routeKdsWorkItemToStation } from "@/lib/kitchen/kds-multi-station";
import { loadKdsStationRoutingRules } from "@/lib/kitchen/kds-station-routing-rules-storage";
import { loadKdsStationRegistry } from "@/services/kitchen/multi-station-service";

export type KdsStationRoutingRulesModel = {
  policyId: typeof KDS_STATION_ROUTING_RULES_POLICY_ID;
  rules: KdsStationRoutingRule[];
  defaultRuleCount: number;
  enabledRuleCount: number;
  stationNames: string[];
  preview: Array<{
    title: string;
    category: string | null;
    station: string;
    reason: string;
  }>;
};

const PREVIEW_SAMPLES = [
  { title: "Ribeye steak", category: "MAINS" },
  { title: "Truffle fries", category: "SIDES" },
  { title: "Margherita pizza", category: "MAINS" },
  { title: "Caesar salad", category: "SIDES" },
  { title: "Iced latte", category: "BEVERAGES" },
  { title: "Chocolate cake", category: "DESSERTS" },
];

export async function loadKdsStationRoutingRulesModel(
  userId: string,
): Promise<KdsStationRoutingRulesModel> {
  const [rules, registry] = await Promise.all([
    loadKdsStationRoutingRules(userId),
    loadKdsStationRegistry(userId),
  ]);

  const preview = PREVIEW_SAMPLES.map((sample) => {
    const ruleMatch = evaluateKdsStationRoutingRules(
      { id: sample.title, title: sample.title, productCategory: sample.category },
      rules,
    );
    if (ruleMatch) {
      return {
        title: sample.title,
        category: sample.category,
        station: ruleMatch.stationName,
        reason: ruleMatch.reason,
      };
    }

    const routed = routeKdsWorkItemToStation(
      {
        id: sample.title,
        title: sample.title,
        station: null,
        status: "TO_PREP",
        priority: "NORMAL",
        quantity: 1,
        dueAtIso: null,
        createdAtIso: new Date().toISOString(),
        startedAtIso: null,
        productCategory: sample.category,
      },
      registry,
      rules,
    );

    return {
      title: sample.title,
      category: sample.category,
      station: routed.routedStation,
      reason: routed.routingReason,
    };
  });

  return {
    policyId: KDS_STATION_ROUTING_RULES_POLICY_ID,
    rules,
    defaultRuleCount: DEFAULT_KDS_STATION_ROUTING_RULES.length,
    enabledRuleCount: rules.filter((rule) => rule.enabled).length,
    stationNames: registry.map((station) => station.name),
    preview,
  };
}

export async function resolveKdsStationForPosLine(
  userId: string,
  input: { productId: string; title: string; category: string },
): Promise<string> {
  const [rules, registry] = await Promise.all([
    loadKdsStationRoutingRules(userId),
    loadKdsStationRegistry(userId),
  ]);

  const routed = routeKdsWorkItemToStation(
    {
      id: input.productId,
      title: input.title,
      station: null,
      status: "TO_PREP",
      priority: "NORMAL",
      quantity: 1,
      dueAtIso: null,
      createdAtIso: new Date().toISOString(),
      startedAtIso: null,
      productCategory: input.category,
      productId: input.productId,
    },
    registry,
    rules,
  );

  return routed.routedStation;
}
