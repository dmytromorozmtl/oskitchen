import { describe, expect, it } from "vitest";

import {
  canDoMealPlan,
  isSuperAdmin,
} from "@/lib/meal-plans/meal-plan-permissions";
import { resolveMealPlanActorScope } from "@/lib/meal-plans/resolve-meal-plan-actor-scope";

describe("meal plans platform bypass", () => {
  it("denies meal plan superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdmin(scope)).toBe(false);
    expect(canDoMealPlan(scope, "meal_plan.cycle.generate_confirmed")).toBe(false);
    expect(canDoMealPlan(scope, "meal_plan.archive")).toBe(false);
  });

  it("allows meal plan superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdmin(scope)).toBe(true);
    expect(canDoMealPlan(scope, "meal_plan.cycle.generate_confirmed")).toBe(true);
    expect(canDoMealPlan(scope, "meal_plan.template.manage")).toBe(true);
  });

  it("passes platformBypass from workspace actor into meal plan scope", () => {
    const scope = resolveMealPlanActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoMealPlan(scope, "meal_plan.cancel")).toBe(true);
  });

  it("preserves owner meal plan access without platformBypass", () => {
    const scope = resolveMealPlanActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoMealPlan(scope, "meal_plan.archive")).toBe(true);
    expect(canDoMealPlan(scope, "meal_plan.cycle.generate_confirmed")).toBe(true);
  });

  it("preserves role-scoped meal plan access without platformBypass", () => {
    const scope = resolveMealPlanActorScope({
      workspaceRole: "STAFF",
      email: "sales@example.com",
      profileRole: "sales",
      profileEmail: "sales@example.com",
    });

    expect(canDoMealPlan(scope, "meal_plan.create")).toBe(true);
    expect(canDoMealPlan(scope, "meal_plan.archive")).toBe(false);
  });
});
