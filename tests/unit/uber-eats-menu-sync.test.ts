import { describe, expect, it } from "vitest";

describe("UberEatsMenuSyncService", () => {
  it("exports menu sync module", async () => {
    const mod = await import("@/services/integrations/uber-eats/menu-sync.service");
    expect(mod.UberEatsMenuSyncService).toBeDefined();
    expect(mod.buildUberEatsMenuPayload).toBeTypeOf("function");
  });
});
