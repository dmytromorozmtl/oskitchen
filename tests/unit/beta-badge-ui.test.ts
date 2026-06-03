import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("beta-badge ui", () => {
  it("exports BETA and Preview badge components", () => {
    const source = readFileSync(join(ROOT, "components/ui/beta-badge.tsx"), "utf8");
    expect(source).toContain("export function BetaBadge");
    expect(source).toContain("export function PreviewBadge");
    expect(source).toContain("export function NavMaturityBadge");
  });

  it("re-exports BetaBadge from integrations shim", () => {
    const shim = readFileSync(join(ROOT, "components/integrations/beta-badge.tsx"), "utf8");
    expect(shim).toContain("@/components/ui/beta-badge");
  });

  it("dashboard nav uses NavMaturityBadge for maturity labels", () => {
    const nav = readFileSync(join(ROOT, "components/dashboard/dashboard-nav.tsx"), "utf8");
    expect(nav).toContain("NavMaturityBadge");
    expect(nav).toContain("@/components/ui/beta-badge");
  });
});
