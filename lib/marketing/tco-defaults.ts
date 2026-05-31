/** Default assumptions for TCO calculator — editable by prospect; not financial advice. */

import { PLAN_REGISTRY } from '@/lib/billing/plan-registry';

export const TCO_HORIZON_YEARS = 5;

export const OS_KITCHEN_PLAN_OPTIONS = [
  { key: 'STARTER' as const, label: 'Starter', monthly: PLAN_REGISTRY.STARTER.priceMonthlyUsd ?? 29 },
  { key: 'PRO' as const, label: 'Pro', monthly: PLAN_REGISTRY.PRO.priceMonthlyUsd ?? 79 },
  { key: 'TEAM' as const, label: 'Team', monthly: PLAN_REGISTRY.TEAM.priceMonthlyUsd ?? 199 },
];

/** Industry-typical hardware POS bundle (Toast/Square-class) — user-adjustable. */
export const TCO_TRADITIONAL_DEFAULTS = {
  softwareMonthly: 0,
  terminalUpfrontEach: 799,
  terminalLeaseMonthlyEach: 25,
  terminalCount: 2,
  installAndTraining: 500,
  annualSupport: 0,
} as const;

export const TCO_OS_KITCHEN_DEFAULTS = {
  planKey: 'PRO' as const,
  tabletUpfrontEach: 0,
  tabletCount: 2,
  useExistingDevices: true,
} as const;
