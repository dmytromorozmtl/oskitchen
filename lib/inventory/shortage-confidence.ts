export type ShortageReadinessLevel = "READY" | "PARTIAL" | "NOT_CONFIGURED";

export function describeShortageReadiness(level: ShortageReadinessLevel): string {
  switch (level) {
    case "READY":
      return "Ingredient stock, recipes, and demand runs exist — shortage math can be evaluated without inventing data.";
    case "PARTIAL":
      return "Some prerequisites exist, but recipes, stock, or demand runs are incomplete — shortage checks stay off.";
    default:
      return "Inventory shortage checks are not active because recipes and/or stock are incomplete.";
  }
}
