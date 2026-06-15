export type MealPlanPermission =
  | "meal_plan.read.list"
  | "meal_plan.read.detail"
  | "meal_plan.create"
  | "meal_plan.update"
  | "meal_plan.pause"
  | "meal_plan.cancel"
  | "meal_plan.archive"
  | "meal_plan.cycle.skip"
  | "meal_plan.cycle.generate_draft"
  | "meal_plan.cycle.generate_confirmed"
  | "meal_plan.template.manage"
  | "meal_plan.read.dietary_only"
  | "meal_plan.read.delivery_only";

export type MealPlanActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  platformBypass?: boolean;
};

export function isSuperAdmin(scope: MealPlanActorScope): boolean {
  return Boolean(scope.platformBypass);
}

export function canDoMealPlan(scope: MealPlanActorScope, permission: MealPlanPermission): boolean {
  if (isSuperAdmin(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();

  switch (permission) {
    case "meal_plan.read.list":
    case "meal_plan.read.detail":
    case "meal_plan.create":
    case "meal_plan.update":
    case "meal_plan.pause":
    case "meal_plan.cycle.skip":
    case "meal_plan.cycle.generate_draft":
    case "meal_plan.template.manage":
      return ["manager", "admin", "sales", "customer_service"].includes(role);
    case "meal_plan.cancel":
    case "meal_plan.archive":
      return ["admin", "manager"].includes(role);
    case "meal_plan.cycle.generate_confirmed":
      // Reserved for future. Off for everyone except superadmin (handled above).
      return false;
    case "meal_plan.read.dietary_only":
      return ["kitchen", "packer", "production", "manager", "admin"].includes(role);
    case "meal_plan.read.delivery_only":
      return ["driver", "dispatcher", "manager", "admin"].includes(role);
  }
}
