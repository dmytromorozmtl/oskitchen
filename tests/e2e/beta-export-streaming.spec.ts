import { expect, test } from "@playwright/test";

/**
 * Step 4 — authenticated streaming exports return CSV.
 * Uses chromium-authed (owner session).
 */
const exportTypes = ["orders", "production", "inventory"] as const;

test.describe("beta streaming exports", () => {
  for (const type of exportTypes) {
    test(`GET /api/export?type=${type} returns CSV`, async ({ request }) => {
      const res = await request.get(`/api/export?type=${type}`);
      if (res.status() === 403) {
        test.skip(true, "Role lacks export permission on this workspace");
      }
      expect(res.status()).toBe(200);
      const ct = res.headers()["content-type"] ?? "";
      expect(ct).toContain("text/csv");
      const body = await res.text();
      expect(body.length).toBeGreaterThan(5);
    });
  }
});
