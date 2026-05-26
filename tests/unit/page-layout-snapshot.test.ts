import { describe, expect, it } from "vitest";

import {
  buildPublishedSectionSnapshots,
  layoutDraftDiffersFromPublished,
  parsePageLayoutMeta,
} from "@/lib/storefront/page-layout-snapshot";

describe("page layout snapshot", () => {
  it("parses published layout meta from page contentJson", () => {
    const meta = parsePageLayoutMeta({
      layoutPublishedAt: "2026-05-21T12:00:00.000Z",
      publishedSections: [{ id: "a", type: "HERO", sortOrder: 0, visible: true, contentJson: {} }],
    });
    expect(meta.layoutPublishedAt).toBe("2026-05-21T12:00:00.000Z");
    expect(meta.publishedSections).toHaveLength(1);
  });

  it("detects draft vs published diff", () => {
    const draft = [{ id: "a", type: "HERO" as const, sortOrder: 0, visible: true }];
    const meta = {
      publishedSections: buildPublishedSectionSnapshots([
        { id: "b", type: "HERO", sortOrder: 0, visible: true, contentJson: {} },
      ]),
    };
    expect(layoutDraftDiffersFromPublished(draft, meta)).toBe(true);
  });
});
