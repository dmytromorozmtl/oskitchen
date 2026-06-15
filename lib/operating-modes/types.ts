export type OperatingMode = "WEEKLY_PREORDER" | "DAILY_SERVICE";

export interface OperatingModeConfig {
  mode: OperatingMode;
  label: string;
  description: string;
  features: {
    weeklyMenu: boolean;
    dailyMenu: boolean;
    productionView: "weekly-batch" | "daily-queue";
    preorderCutoff: boolean;
    sameDayOrders: boolean;
    quickPOS: boolean;
  };
  applicableBusinessTypes: string[];
}

export const OPERATING_MODE_CONFIGS: Record<OperatingMode, OperatingModeConfig> = {
  WEEKLY_PREORDER: {
    mode: "WEEKLY_PREORDER",
    label: "Weekly Preorder",
    description: "Weekly menu → batch production → delivery/pickup",
    features: {
      weeklyMenu: true,
      dailyMenu: false,
      productionView: "weekly-batch",
      preorderCutoff: true,
      sameDayOrders: false,
      quickPOS: false,
    },
    applicableBusinessTypes: ["MEAL_PREP", "BAKERY", "CATERING", "MULTI_BRAND"],
  },
  DAILY_SERVICE: {
    mode: "DAILY_SERVICE",
    label: "Daily Service",
    description: "Day-of orders → real-time production → serve",
    features: {
      weeklyMenu: false,
      dailyMenu: true,
      productionView: "daily-queue",
      preorderCutoff: false,
      sameDayOrders: true,
      quickPOS: true,
    },
    applicableBusinessTypes: [
      "RESTAURANT",
      "CAFE",
      "BAR",
      "GHOST_KITCHEN",
      "CLOUD_KITCHEN",
      "OTHER",
    ],
  },
};
