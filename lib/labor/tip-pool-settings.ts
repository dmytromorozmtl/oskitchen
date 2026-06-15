export type TipPoolDistributionMethod =
  | "equal"
  | "hours_weighted"
  | "role_weighted"
  | "hybrid_pos_pool";

export type TipPoolRules = {
  enabled: boolean;
  distributionMethod: TipPoolDistributionMethod;
  /** Percent of collected tips routed into the shared pool (0–100). */
  poolPercent: number;
  roleWeights: Record<string, number>;
  eligibleRoleTypes: string[];
};

export const DEFAULT_TIP_POOL_RULES: TipPoolRules = {
  enabled: true,
  distributionMethod: "hours_weighted",
  poolPercent: 100,
  roleWeights: {
    CUSTOMER_SERVICE: 1,
    MANAGER: 0.25,
    KITCHEN_LEAD: 0.65,
    LINE_COOK: 0.55,
    PREP_COOK: 0.5,
    PACKER: 0.45,
    DRIVER: 0.35,
    CATERING_COORDINATOR: 0.4,
  },
  eligibleRoleTypes: [
    "MANAGER",
    "KITCHEN_LEAD",
    "PREP_COOK",
    "LINE_COOK",
    "PACKER",
    "DRIVER",
    "CUSTOMER_SERVICE",
    "CATERING_COORDINATOR",
  ],
};

const VALID_METHODS: TipPoolDistributionMethod[] = [
  "equal",
  "hours_weighted",
  "role_weighted",
  "hybrid_pos_pool",
];

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function parseTipPoolRules(raw: unknown): TipPoolRules {
  if (!raw || typeof raw !== "object") return DEFAULT_TIP_POOL_RULES;
  const o = raw as Record<string, unknown>;
  const method = o.distributionMethod;
  const distributionMethod = VALID_METHODS.includes(method as TipPoolDistributionMethod)
    ? (method as TipPoolDistributionMethod)
    : DEFAULT_TIP_POOL_RULES.distributionMethod;

  const roleWeights: Record<string, number> = { ...DEFAULT_TIP_POOL_RULES.roleWeights };
  if (o.roleWeights && typeof o.roleWeights === "object") {
    for (const [key, value] of Object.entries(o.roleWeights as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isFinite(value)) roleWeights[key] = value;
    }
  }

  const eligibleRoleTypes = Array.isArray(o.eligibleRoleTypes)
    ? o.eligibleRoleTypes.filter((r): r is string => typeof r === "string")
    : DEFAULT_TIP_POOL_RULES.eligibleRoleTypes;

  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : DEFAULT_TIP_POOL_RULES.enabled,
    distributionMethod,
    poolPercent: Math.max(0, Math.min(100, num(o.poolPercent, DEFAULT_TIP_POOL_RULES.poolPercent))),
    roleWeights,
    eligibleRoleTypes,
  };
}

export function tipPoolRulesFromSettingsCenter(settingsCenterJson: unknown): TipPoolRules {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return DEFAULT_TIP_POOL_RULES;
  const labor = (settingsCenterJson as Record<string, unknown>).labor;
  if (!labor || typeof labor !== "object") return DEFAULT_TIP_POOL_RULES;
  return parseTipPoolRules((labor as Record<string, unknown>).tipPool);
}

export function mergeTipPoolIntoSettingsCenter(
  settingsCenterJson: unknown,
  rules: TipPoolRules,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const labor =
    base.labor && typeof base.labor === "object"
      ? { ...(base.labor as Record<string, unknown>) }
      : {};
  labor.tipPool = rules;
  base.labor = labor;
  return base;
}
