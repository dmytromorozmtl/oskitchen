import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { countSuspenseBoundaries } from "@/lib/testing/suspense-skeleton-harness";
import { SUSPENSE_WAVE_1_ROUTES } from "@/lib/testing/suspense-skeleton-policy";

const ROOT = process.cwd();

describe("Suspense wave 1 critical routes (P1-10)", () => {
  it.each(SUSPENSE_WAVE_1_ROUTES)(
    "$id page wraps async content in Suspense with named skeleton",
    (route) => {
      const page = readFileSync(join(ROOT, route.pagePath), "utf8");
      expect(countSuspenseBoundaries(page)).toBeGreaterThanOrEqual(1);
      expect(page).toContain("Suspense");
      expect(page).toContain(route.skeleton);

      if ("asyncComponent" in route && route.asyncComponent) {
        expect(page).toContain(route.asyncComponent);
      }
      if ("asyncMarkers" in route && route.asyncMarkers) {
        for (const marker of route.asyncMarkers) {
          expect(page).toContain(marker);
        }
      }
    },
  );
});
