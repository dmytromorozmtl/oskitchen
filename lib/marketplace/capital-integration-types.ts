function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type MarketplaceCapitalSettings = {
  creditLimitUsd: number | null;
  netTermsDays: number;
  paymentSchedules: MarketplacePaymentSchedule[];
};

export type MarketplaceCreditLine = {
  limitUsd: number;
  usedUsd: number;
  availableUsd: number;
  netTermsDays: number;
  source: "settings" | "gmv_derived" | "capital_funded";
  capitalBoostUsd: number;
};

export type MarketplacePaymentScheduleEntry = {
  dueDate: string;
  amountUsd: number;
  status: "scheduled" | "paid" | "overdue";
  orderId: string;
  poNumber: string | null;
};

export type MarketplacePaymentSchedule = {
  id: string;
  workspaceId: string;
  orderIds: string[];
  totalUsd: number;
  netTermsDays: number;
  createdAt: string;
  entries: MarketplacePaymentScheduleEntry[];
};

export type MarketplaceEquipmentFinancingOption = {
  partnerSlug: string;
  partnerName: string;
  title: string;
  summary: string | null;
  amountMin: number | null;
  amountMax: number | null;
  currency: string;
  termLabel: string | null;
  deepLink: string | null;
  eligibleOrderTotal: number;
};

export const DEFAULT_MARKETPLACE_CAPITAL_SETTINGS: MarketplaceCapitalSettings = {
  creditLimitUsd: null,
  netTermsDays: 30,
  paymentSchedules: [],
};

export function parseMarketplaceCapitalSettings(raw: unknown): MarketplaceCapitalSettings {
  if (!isPlainObject(raw)) return { ...DEFAULT_MARKETPLACE_CAPITAL_SETTINGS };

  const creditLimitUsd = parsePositiveNumber(raw.creditLimitUsd);
  const netTermsDays = parsePositiveInt(raw.netTermsDays) ?? DEFAULT_MARKETPLACE_CAPITAL_SETTINGS.netTermsDays;

  const paymentSchedules = Array.isArray(raw.paymentSchedules)
    ? raw.paymentSchedules
        .map(parsePaymentSchedule)
        .filter((schedule): schedule is MarketplacePaymentSchedule => schedule != null)
    : [];

  return { creditLimitUsd, netTermsDays, paymentSchedules };
}

export function marketplaceCapitalFromSettingsCenter(
  settingsCenterJson: unknown,
): MarketplaceCapitalSettings {
  if (!isPlainObject(settingsCenterJson)) return { ...DEFAULT_MARKETPLACE_CAPITAL_SETTINGS };
  return parseMarketplaceCapitalSettings(settingsCenterJson.marketplaceCapital);
}

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function parsePositiveInt(value: unknown): number | null {
  const num = parsePositiveNumber(value);
  if (num == null) return null;
  return Math.round(num);
}

function parsePaymentSchedule(raw: unknown): MarketplacePaymentSchedule | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.workspaceId !== "string") return null;
  const orderIds = Array.isArray(raw.orderIds)
    ? raw.orderIds.filter((id): id is string => typeof id === "string")
    : [];
  const entries = Array.isArray(raw.entries)
    ? raw.entries
        .map(parseScheduleEntry)
        .filter((entry): entry is MarketplacePaymentScheduleEntry => entry != null)
    : [];
  return {
    id: raw.id,
    workspaceId: raw.workspaceId,
    orderIds,
    totalUsd: parsePositiveNumber(raw.totalUsd) ?? 0,
    netTermsDays: parsePositiveInt(raw.netTermsDays) ?? 30,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    entries,
  };
}

function parseScheduleEntry(raw: unknown): MarketplacePaymentScheduleEntry | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.dueDate !== "string" || typeof raw.orderId !== "string") return null;
  const status = raw.status;
  if (status !== "scheduled" && status !== "paid" && status !== "overdue") return null;
  return {
    dueDate: raw.dueDate,
    amountUsd: parsePositiveNumber(raw.amountUsd) ?? 0,
    status,
    orderId: raw.orderId,
    poNumber: typeof raw.poNumber === "string" ? raw.poNumber : null,
  };
}

export function mergeMarketplaceCapitalIntoSettingsCenter(
  settingsCenterJson: unknown,
  capital: Partial<MarketplaceCapitalSettings>,
): Record<string, unknown> {
  const root = isPlainObject(settingsCenterJson) ? { ...settingsCenterJson } : {};
  const current = marketplaceCapitalFromSettingsCenter(root);
  root.marketplaceCapital = {
    ...current,
    ...capital,
    paymentSchedules: capital.paymentSchedules ?? current.paymentSchedules,
  };
  return root;
}
