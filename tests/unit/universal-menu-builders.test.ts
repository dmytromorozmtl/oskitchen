import { describe, expect, it } from "vitest";

import {
  applyPushOutcomesToSyncStatus,
  buildUniversalMenuItem,
  emptySyncStatus,
  mergeChannelOverrides,
  resolveEffectiveChannelItem,
  summarizeSyncHealth,
} from "@/lib/menu/universal-menu-builders";
import type { UniversalMenuMaster } from "@/lib/menu/universal-menu-types";

const master: UniversalMenuMaster = {
  title: "House Burger",
  description: "Angus patty",
  price: 14.5,
  category: "MAINS",
  image: "https://cdn.test/burger.jpg",
  active: true,
  posVisible: true,
  storefrontVisible: true,
};

describe("universal menu builders", () => {
  it("merges channel overrides without dropping other channels", () => {
    const merged = mergeChannelOverrides(
      { pos: { price: 12 } },
      { website: { title: "Web Burger" } },
    );
    expect(merged.pos.price).toBe(12);
    expect(merged.website.title).toBe("Web Burger");
    expect(merged.shopify).toEqual({});
  });

  it("resolves effective channel item with override precedence", () => {
    const effective = resolveEffectiveChannelItem(master, "uberEats", {
      price: 16.99,
      title: "Uber Burger",
      enabled: true,
    });
    expect(effective.price).toBe(16.99);
    expect(effective.title).toBe("Uber Burger");
    expect(effective.enabled).toBe(true);
  });

  it("defaults channel enabled from master visibility flags", () => {
    const hidden = resolveEffectiveChannelItem(
      { ...master, posVisible: false },
      "pos",
      {},
    );
    expect(hidden.enabled).toBe(false);

    const web = resolveEffectiveChannelItem(master, "website", {});
    expect(web.enabled).toBe(true);
  });

  it("builds universal menu item from product + stored overrides", () => {
    const item = buildUniversalMenuItem({
      productId: "p1",
      menuId: "m1",
      master,
      stored: {
        channelOverrides: { doordash: { externalId: "dd-99", enabled: true } },
        syncStatus: { doordash: { status: "synced", lastSyncedAt: "2026-06-01T00:00:00Z", lastError: null } },
      },
    });
    expect(item.channelOverrides.doordash.externalId).toBe("dd-99");
    expect(item.syncStatus.doordash.status).toBe("synced");
  });

  it("applies push outcomes to sync status", () => {
    const base = emptySyncStatus();
    const next = applyPushOutcomesToSyncStatus(base, [
      { channel: "pos", status: "synced" },
      { channel: "shopify", status: "error", message: "Not mapped" },
    ]);
    expect(next.pos.status).toBe("synced");
    expect(next.pos.lastSyncedAt).toBeTruthy();
    expect(next.shopify.status).toBe("error");
    expect(next.shopify.lastError).toBe("Not mapped");
  });

  it("summarizes sync health for UI dots", () => {
    const green = emptySyncStatus();
    for (const channel of Object.keys(green) as (keyof typeof green)[]) {
      green[channel] = { status: "synced", lastSyncedAt: null, lastError: null };
    }
    expect(summarizeSyncHealth(green)).toBe("green");

    const yellow = { ...green, uberEats: { status: "pending" as const, lastSyncedAt: null, lastError: null } };
    expect(summarizeSyncHealth(yellow)).toBe("yellow");
  });
});
