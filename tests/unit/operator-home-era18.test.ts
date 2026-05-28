import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  listOperatorHomeActions,
  pickOperatorHomePrimaryAction,
  resolveOperatorHomePersona,
} from "@/lib/navigation/operator-home-era18";
import { OPERATOR_HOME_ERA18_POLICY_ID } from "@/lib/navigation/operator-home-era18-policy";

function granted(...keys: PermissionKey[]) {
  return new Set(keys) as ReadonlySet<PermissionKey>;
}

describe("operator home era18", () => {
  it("locks era18 operator home policy id", () => {
    expect(OPERATOR_HOME_ERA18_POLICY_ID).toBe("era18-operator-home-v1");
  });

  it("routes owners to owner home", () => {
    expect(
      resolveOperatorHomePersona({
        workspaceRole: "OWNER",
        staffRoleType: null,
        granted: granted("orders.manage"),
        platformBypass: false,
      }),
    ).toBe("owner");
  });

  it("routes kitchen staff to kitchen home", () => {
    expect(
      resolveOperatorHomePersona({
        workspaceRole: "STAFF",
        staffRoleType: "LINE_COOK",
        granted: granted("kitchen.view", "kitchen.bump", "production.manage"),
        platformBypass: false,
      }),
    ).toBe("kitchen");
  });

  it("routes pos-only staff to cashier home", () => {
    expect(
      resolveOperatorHomePersona({
        workspaceRole: "STAFF",
        staffRoleType: "CUSTOMER_SERVICE",
        granted: granted("pos.access", "pos.checkout", "orders.manage"),
        platformBypass: false,
      }),
    ).toBe("cashier");
  });

  it("routes manager signals to manager home", () => {
    expect(
      resolveOperatorHomePersona({
        workspaceRole: "STAFF",
        staffRoleType: "CUSTOM",
        granted: granted("pos.access", "pos.checkout", "pos.discount.apply", "orders.manage"),
        platformBypass: false,
      }),
    ).toBe("manager");
  });

  it("filters quick actions by permission", () => {
    const actions = listOperatorHomeActions("cashier", granted("pos.access"));
    expect(actions.some((action) => action.id === "pos-terminal")).toBe(true);
    expect(actions.some((action) => action.id === "orders")).toBe(false);
    expect(hasPermission(granted("pos.access"), "pos.access")).toBe(true);
  });

  it("picks a primary action for each persona catalog", () => {
    const cashier = listOperatorHomeActions(
      "cashier",
      granted("pos.access", "pos.checkout", "orders.manage"),
    );
    expect(pickOperatorHomePrimaryAction(cashier)?.id).toBe("pos-terminal");

    const kitchen = listOperatorHomeActions(
      "kitchen",
      granted("kitchen.view", "production.manage", "orders.manage", "packing.manage"),
    );
    expect(pickOperatorHomePrimaryAction(kitchen)?.id).toBe("kds");
  });
});
