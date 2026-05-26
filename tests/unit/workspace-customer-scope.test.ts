import { describe, expect, it } from "vitest";

import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { kitchenCustomerScopeWhere } from "@/lib/scope/workspace-customer-scope";

describe("workspace-customer-scope", () => {
  it("matches canonical owner OR-scope when workspaceId is set", () => {
    const ownerId = "00000000-0000-4000-8000-000000000001";
    const workspaceId = "00000000-0000-4000-8000-000000000099";
    expect(kitchenCustomerScopeWhere(ownerId, workspaceId)).toEqual(
      buildOwnerScopedWhere(ownerId, workspaceId),
    );
  });

  it("falls back to userId-only when workspace is null", () => {
    const ownerId = "00000000-0000-4000-8000-000000000001";
    expect(kitchenCustomerScopeWhere(ownerId, null)).toEqual({ userId: ownerId });
  });
});
