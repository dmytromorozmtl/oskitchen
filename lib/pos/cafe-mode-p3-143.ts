import {
  CAFE_MODE_P3_143_QUERY_PARAM,
  CAFE_MODE_P3_143_ROUTE,
  CAFE_MODE_P3_143_POLICY_ID,
  CAFE_MODE_P3_143_COMPETITOR,
  CAFE_MODE_P3_143_MAX_SCREENS,
  CAFE_MODE_P3_143_SCREEN_IDS,
} from "@/lib/pos/cafe-mode-p3-143-policy";

export const CAFE_MODE_TERMINAL_ROUTE = CAFE_MODE_P3_143_ROUTE;

export function cafeModeFromSearchParam(value?: string | null): boolean {
  return value === "1" || value === "true";
}

/** Counter cafés and explicit ?cafe=1 resolve to café mode. */
export function resolveCafeMode(input: {
  cafeParam?: string | null;
  businessType?: string | null;
}): boolean {
  const raw = input.cafeParam?.trim();
  if (raw === "0" || raw === "false") return false;
  if (raw != null && raw !== "") {
    return cafeModeFromSearchParam(raw);
  }
  return input.businessType === "CAFE";
}

export function cafeModeToggleHref(active: boolean): string {
  return active ? CAFE_MODE_P3_143_ROUTE : `${CAFE_MODE_P3_143_ROUTE}?${CAFE_MODE_P3_143_QUERY_PARAM}=1`;
}

export function cafeModeHeadline(active: boolean): string {
  return active
    ? "Café mode — 5 screens, counter-first checkout."
    : "Standard POS — full terminal controls.";
}

export { CAFE_MODE_P3_143_POLICY_ID, CAFE_MODE_P3_143_COMPETITOR, CAFE_MODE_P3_143_MAX_SCREENS, CAFE_MODE_P3_143_SCREEN_IDS };
