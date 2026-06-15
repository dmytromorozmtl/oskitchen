import { describe, expect, it } from "vitest";

import { resolveForecastActorScope } from "@/lib/forecast/resolve-forecast-actor-scope";
import {
  canDoForecast,
  isSuperAdminForecast,
} from "@/lib/forecast/forecast-permissions";

describe("forecast platform bypass", () => {
  it("denies forecast superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminForecast(scope)).toBe(false);
    expect(canDoForecast(scope, "forecast.run")).toBe(false);
    expect(canDoForecast(scope, "forecast.send_to_production")).toBe(false);
  });

  it("allows forecast superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminForecast(scope)).toBe(true);
    expect(canDoForecast(scope, "forecast.run")).toBe(true);
    expect(canDoForecast(scope, "forecast.settings.manage")).toBe(true);
  });

  it("passes platformBypass from workspace actor into forecast scope", () => {
    const scope = resolveForecastActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoForecast(scope, "forecast.export")).toBe(true);
  });

  it("preserves owner forecast access without platformBypass", () => {
    const scope = resolveForecastActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoForecast(scope, "forecast.run")).toBe(true);
    expect(canDoForecast(scope, "forecast.send_to_demand")).toBe(true);
  });
});
