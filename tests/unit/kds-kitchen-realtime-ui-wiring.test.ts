import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KDS_KITCHEN_DASHBOARD_ROUTE } from "@/lib/kitchen/kds-realtime-ui";

const ROOT = process.cwd();

describe("kds kitchen dashboard realtime ui wiring", () => {
  it("wires sticky LIVE/POLLING bar into kitchen page", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/page.tsx"), "utf8");
    expect(page).toContain("KdsKitchenDailyClient");
    expect(page).toContain("kds-kitchen-daily-client");
  });

  it("defines kitchen realtime bar with status badge", () => {
    const bar = readFileSync(
      join(ROOT, "app/dashboard/kitchen/kds-kitchen-realtime-bar.tsx"),
      "utf8",
    );
    expect(bar).toContain("KdsRealtimeConnectionBar");
    expect(bar).toContain("kds-kitchen-realtime-bar");
  });

  it("ships canonical connection bar component", () => {
    const bar = readFileSync(
      join(ROOT, "components/kitchen/kds-realtime-connection-bar.tsx"),
      "utf8",
    );
    expect(bar).toContain("kds-realtime-status-badge");
    expect(bar).toContain("kds-realtime-connection-bar");
  });

  it("uses single Realtime subscription in kitchen daily client shell", () => {
    const client = readFileSync(
      join(ROOT, "app/dashboard/kitchen/kds-kitchen-daily-client.tsx"),
      "utf8",
    );
    expect(client).toContain("useKdsRealtime");
    expect(client).toContain("KdsKitchenRealtimeBar");
    expect(client).toContain("slo");
    expect(client).toContain("playKdsLiveConnectChime");
  });

  it("locks dashboard route constant", () => {
    expect(KDS_KITCHEN_DASHBOARD_ROUTE).toBe("/dashboard/kitchen");
  });
});
