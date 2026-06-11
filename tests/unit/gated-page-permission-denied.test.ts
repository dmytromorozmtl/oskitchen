import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GATED_PAGE_FORBIDDEN_DENIAL_PATTERNS,
  GATED_PAGE_PERMISSION_DENIED_MODULES,
  GATED_PAGE_PERMISSION_DENIED_POLICY_ID,
} from "@/lib/ux/gated-page-permission-denied-policy";
import { auditPermissionDeniedModule } from "@/lib/design/permission-denied-audit-policy";
import { resolvePermissionDeniedSurface } from "@/lib/ux/permission-denied-copy";

const ROOT = process.cwd();

describe("gated page permission denied (P1-26)", () => {
  it("locks policy id", () => {
    expect(GATED_PAGE_PERMISSION_DENIED_POLICY_ID).toBe(
      "gated-page-permission-denied-p1-26-v1",
    );
  });

  it.each(["command_center", "staff_schedule", "marketplace_hub"] as const)(
    "surface %s includes explanation and recovery href",
    (surfaceId) => {
      const surface = resolvePermissionDeniedSurface(surfaceId);
      expect(surface.description.length).toBeGreaterThan(20);
      expect(surface.primaryHref.startsWith("/dashboard")).toBe(true);
      expect(surface.primaryLabel.length).toBeGreaterThan(0);
    },
  );

  it.each(GATED_PAGE_PERMISSION_DENIED_MODULES)(
    "module %s uses PermissionDeniedSurfaceCard",
    (modulePath) => {
      const audit = auditPermissionDeniedModule(modulePath, ROOT);
      expect(audit.passed, modulePath).toBe(true);
      const source = readFileSync(join(ROOT, modulePath), "utf8");
      for (const pattern of GATED_PAGE_FORBIDDEN_DENIAL_PATTERNS) {
        expect(source.match(pattern), modulePath).toBeNull();
      }
    },
  );
});
