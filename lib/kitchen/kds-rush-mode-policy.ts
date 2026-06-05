import { KDS_PRIORITY_LANE_ERA19_POLICY_ID } from "@/lib/kitchen/kds-priority-lane-era19-policy";

export const KDS_RUSH_MODE_POLICY_ID = "kds-rush-mode-v1" as const;

export const KDS_RUSH_MODE_COMPONENT = "components/kitchen/rush-mode.tsx" as const;

export const KDS_RUSH_MODE_ANCHOR = "kds-rush-mode" as const;

export const KDS_RUSH_MODE_EXTENDS_POLICIES = [KDS_PRIORITY_LANE_ERA19_POLICY_ID] as const;

/** Active tickets (prep + expo) to enter building rush. */
export const KDS_RUSH_BUILDING_ACTIVE_MIN = 5 as const;

/** Active tickets to enter peak rush. */
export const KDS_RUSH_PEAK_ACTIVE_MIN = 8 as const;

/** Rolling window for arrival-rate peak detection. */
export const KDS_RUSH_ARRIVAL_WINDOW_MS = 10 * 60 * 1000;

export const KDS_RUSH_ARRIVALS_BUILDING_MIN = 4 as const;

export const KDS_RUSH_ARRIVALS_PEAK_MIN = 6 as const;

export const KDS_RUSH_OVERDUE_BUILDING_MIN = 2 as const;

export const KDS_RUSH_OVERDUE_PEAK_MIN = 3 as const;

/** Priority routes shown during rush (allergen/overdue first, then oldest). */
export const KDS_RUSH_MAX_PRIORITY_ROUTES = 5 as const;
