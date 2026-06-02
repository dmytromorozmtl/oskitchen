import { describe, expect, it } from "vitest";

import { marketplaceItemPayload, toSyncResult } from "@/lib/menu/channel-sync-types";
import { CHANNEL_MENU_SYNC_ADAPTERS, syncResultToPushOutcome } from "@/services/menu/sync";
import { MENU_CHANNELS } from "@/lib/menu/universal-menu-types";

describe("channel sync registry", () => {
  it("registers all seven menu channels", () => {
    for (const channel of MENU_CHANNELS) {
      expect(typeof CHANNEL_MENU_SYNC_ADAPTERS[channel]).toBe("function");
    }
  });

  it("builds marketplace item payload in cents", () => {
    const payload = marketplaceItemPayload({
      userId: "u1",
      productId: "p1",
      previousMaster: {
        title: "Burger",
        description: null,
        price: 12,
        category: "MAINS",
        image: null,
        active: true,
        posVisible: true,
        storefrontVisible: true,
      },
      effective: {
        channel: "doordash",
        enabled: true,
        title: "DD Burger",
        description: "Best",
        price: 13.5,
        image: null,
        category: "MAINS",
        externalId: "dd-1",
      },
    });
    expect(payload.external_id).toBe("dd-1");
    expect(payload.name).toBe("DD Burger");
    expect(payload.price).toBe(1350);
  });

  it("maps sync result to push outcome", () => {
    const outcome = syncResultToPushOutcome(
      "shopify",
      toSyncResult(true, "synced", "Catalog updated"),
    );
    expect(outcome.channel).toBe("shopify");
    expect(outcome.status).toBe("synced");
    expect(outcome.message).toBe("Catalog updated");
  });
});
