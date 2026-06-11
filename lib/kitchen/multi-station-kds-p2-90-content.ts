import {
  MULTI_STATION_KDS_ROUTE,
  MULTI_STATION_KDS_STATION_COUNT,
} from "@/lib/kitchen/multi-station-kds-p2-90-policy";
import { MULTI_STATION_KDS_CORE_STATIONS } from "@/lib/kitchen/multi-station-kds-p2-90-core-stations";

export const MULTI_STATION_KDS_EYEBROW = "Multi-station KDS · line routing" as const;

export const MULTI_STATION_KDS_HEADLINE =
  "Grill, fry, cold, bar, expo, and packing — routed tickets per station" as const;

export const MULTI_STATION_KDS_SUBLINE =
  "Six core stations for typical line kitchens — keyword and category routing via kds-multi-station-v1. BETA: verify rush-hour SLA — not certified production KDS websocket parity." as const;

export const MULTI_STATION_KDS_STATIONS = MULTI_STATION_KDS_CORE_STATIONS.map((station) => ({
  id: station.id,
  label: station.name,
  foodType: station.foodType,
  keywords: station.keywords.slice(0, 4).join(", "),
  module: "lib/kitchen/kds-multi-station.ts",
}));

export const MULTI_STATION_KDS_OPERATOR_LINKS = [
  { label: "Kitchen display", href: "/dashboard/kitchen" },
  { label: "Routing rules", href: "/dashboard/kitchen/routing-rules" },
  { label: "Production view", href: "/dashboard/production" },
] as const;

export { MULTI_STATION_KDS_ROUTE, MULTI_STATION_KDS_STATION_COUNT };
