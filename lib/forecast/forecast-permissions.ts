export type ForecastPermission =
  | "forecast.read"
  | "forecast.run"
  | "forecast.adjust"
  | "forecast.send_to_production"
  | "forecast.send_to_demand"
  | "forecast.export"
  | "forecast.settings.manage"
  | "forecast.history.read";

export type ForecastActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  platformBypass?: boolean;
};

export function isSuperAdminForecast(scope: ForecastActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canDoForecast(scope: ForecastActorScope, permission: ForecastPermission): boolean {
  if (isSuperAdminForecast(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();

  switch (permission) {
    case "forecast.read":
    case "forecast.history.read":
      return [
        "manager",
        "admin",
        "kitchen_lead",
        "kitchen",
        "production",
        "purchasing",
        "sales",
        "viewer",
      ].includes(role);
    case "forecast.run":
    case "forecast.adjust":
    case "forecast.settings.manage":
      return ["manager", "admin"].includes(role);
    case "forecast.send_to_production":
      return ["manager", "admin", "kitchen_lead"].includes(role);
    case "forecast.send_to_demand":
      return ["manager", "admin", "purchasing"].includes(role);
    case "forecast.export":
      return ["manager", "admin", "purchasing", "kitchen_lead"].includes(role);
    default:
      return false;
  }
}
