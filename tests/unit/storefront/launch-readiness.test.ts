import { describe, expect, it } from "vitest";

import {
  publishChecklistBlocksGoLive,
  PUBLISH_BLOCKER_IDS,
} from "@/lib/storefront/launch-readiness";
import type { PublishChecklistItem } from "@/lib/storefront/publish-checklist";

function item(id: string, ok: boolean): PublishChecklistItem {
  return { id, label: id, ok };
}

describe("launch readiness", () => {
  it("blocks when critical checklist items fail", () => {
    const gate = publishChecklistBlocksGoLive([
      item("nav", false),
      item("theme", true),
      item("sections", true),
    ]);
    expect(gate.blocked).toBe(true);
    expect(gate.failing.map((f) => f.id)).toEqual(["nav"]);
  });

  it("passes when blockers ok", () => {
    const gate = publishChecklistBlocksGoLive(
      PUBLISH_BLOCKER_IDS.map((id) => item(id, true)),
    );
    expect(gate.blocked).toBe(false);
  });

  it("translations failure does not block go-live", () => {
    const gate = publishChecklistBlocksGoLive([
      item("nav", true),
      item("theme", true),
      item("sections", true),
      item("translations", false),
    ]);
    expect(gate.blocked).toBe(false);
  });
});
