import { isSuperAdminEmail } from "@/lib/platform-owner";

export type AnalyticsPermission =
  | "analytics.read.executive"
  | "analytics.read.revenue"
  | "analytics.read.orders"
  | "analytics.read.channels"
  | "analytics.read.customers"
  | "analytics.read.customer_pii"
  | "analytics.read.production"
  | "analytics.read.delivery"
  | "analytics.read.catering"
  | "analytics.read.meal_plans"
  | "analytics.read.inventory"
  | "analytics.read.forecast"
  | "analytics.read.cost_margin"
  | "analytics.snapshot.create"
  | "analytics.saved_view.manage"
  | "analytics.alert.manage"
  | "analytics.export.csv";

export type AnalyticsActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
};

export function isSuperAdminAnalytics(scope: AnalyticsActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canDoAnalytics(scope: AnalyticsActorScope, permission: AnalyticsPermission): boolean {
  if (isSuperAdminAnalytics(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();

  const readAny = ["analytics.read.executive", "analytics.read.orders"].includes(permission);
  if (readAny && ["manager", "admin", "sales", "kitchen_lead", "kitchen", "production", "packer", "packing", "driver", "dispatcher", "accountant", "viewer"].includes(role)) {
    return true;
  }

  switch (permission) {
    case "analytics.read.revenue":
    case "analytics.read.channels":
    case "analytics.read.cost_margin":
    case "analytics.read.forecast":
      return ["manager", "admin", "accountant"].includes(role);
    case "analytics.read.customers":
      return ["manager", "admin", "sales"].includes(role);
    case "analytics.read.customer_pii":
      return ["manager", "admin"].includes(role);
    case "analytics.read.production":
      return ["manager", "admin", "kitchen", "production", "kitchen_lead"].includes(role);
    case "analytics.read.delivery":
      return ["manager", "admin", "driver", "dispatcher"].includes(role);
    case "analytics.read.catering":
      return ["manager", "admin", "sales"].includes(role);
    case "analytics.read.meal_plans":
      return ["manager", "admin", "sales"].includes(role);
    case "analytics.read.inventory":
      return ["manager", "admin", "kitchen", "production", "kitchen_lead", "accountant"].includes(role);
    case "analytics.snapshot.create":
    case "analytics.saved_view.manage":
    case "analytics.alert.manage":
    case "analytics.export.csv":
      return ["manager", "admin"].includes(role);
    default:
      return false;
  }
}
