import { describe, expect, it } from "vitest";

import {
  buildCommandPaletteItems,
  clampCommandPaletteActiveIndex,
  COMMAND_PALETTE_EMPTY_HINTS,
  COMMAND_PALETTE_UX_POLICY_ID,
  moveCommandPaletteActiveIndex,
  parseCommandPaletteRecent,
  pushCommandPaletteRecent,
  rankCommandPaletteRoutes,
} from "@/lib/navigation/command-palette-ux-policy";

describe("command palette UX (DES-12)", () => {
  it("defines UX policy id and empty-state hints", () => {
    expect(COMMAND_PALETTE_UX_POLICY_ID).toBe("command-palette-ux-des12-v1");
    expect(COMMAND_PALETTE_EMPTY_HINTS).toContain("today");
    expect(COMMAND_PALETTE_EMPTY_HINTS.length).toBeGreaterThanOrEqual(5);
  });

  it("builds flat selectable items with maturity badges on routes", () => {
    const items = buildCommandPaletteItems({
      hits: [
        {
          id: "ord-1",
          kind: "order",
          title: "Order #42",
          subtitle: "Ready",
          href: "/dashboard/orders/ord-1",
        },
      ],
      routes: [
        { href: "/dashboard/copilot", label: "Copilot" },
        { href: "/dashboard/today", label: "Today" },
      ],
    });
    expect(items).toHaveLength(3);
    expect(items[0]?.kind).toBe("hit");
    const copilot = items.find((i) => i.kind === "route" && i.href === "/dashboard/copilot");
    expect(copilot?.kind).toBe("route");
    if (copilot?.kind === "route") {
      expect(copilot.maturityBadge).toBe("Preview");
    }
  });

  it("clamps and moves keyboard active index", () => {
    expect(clampCommandPaletteActiveIndex(5, 3)).toBe(2);
    expect(moveCommandPaletteActiveIndex(0, "down", 3)).toBe(1);
    expect(moveCommandPaletteActiveIndex(0, "up", 3)).toBe(0);
    expect(moveCommandPaletteActiveIndex(2, "down", 3)).toBe(2);
  });

  it("ranks routes by prefix and exact match", () => {
    const routes = [
      { href: "/dashboard/today", label: "Today", k: "today" },
      { href: "/dashboard/orders", label: "Orders", k: "orders" },
      { href: "/dashboard/pos", label: "POS", k: "pos" },
    ];
    const ranked = rankCommandPaletteRoutes("today", routes);
    expect(ranked[0]?.href).toBe("/dashboard/today");
  });

  it("persists recent command palette hrefs", () => {
    expect(parseCommandPaletteRecent(null)).toEqual([]);
    expect(parseCommandPaletteRecent('["/a","/b"]')).toEqual(["/a", "/b"]);
    expect(pushCommandPaletteRecent(["/a", "/b"], "/c")).toEqual(["/c", "/a", "/b"]);
    expect(pushCommandPaletteRecent(["/a", "/b"], "/a")).toEqual(["/a", "/b"]);
  });
});
