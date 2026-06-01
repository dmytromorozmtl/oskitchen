import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PERMISSION_DENIED_UX_ERA17_CARD_MODULE } from "@/lib/ux/permission-denied-era17-policy";

const ROOT = process.cwd();

describe("permission-denied-card ui module", () => {
  it("exports unified card with era17 test id", () => {
    const path = join(ROOT, PERMISSION_DENIED_UX_ERA17_CARD_MODULE);
    expect(existsSync(path)).toBe(true);
    const source = readFileSync(path, "utf8");
    expect(source).toContain("export function PermissionDeniedCard");
    expect(source).toContain("export function PermissionDeniedSurfaceCard");
    expect(source).toContain("permission-denied-card");
  });
});
