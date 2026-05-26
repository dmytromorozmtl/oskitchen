import { expect, test } from "@playwright/test";

const THEME_ARM_COOKIE = "kos_ab_theme";
const VISITOR_COOKIE = "kos_ab_vid";

/**
 * Sprint 5 — edge / app theme experiment sticky assignment.
 * Staging: THEME_EXPERIMENT_EDGE=1 + Edge Config key theme-exp:{slug}.
 */
test.describe("Sprint 5 theme experiment edge smoke", () => {
  test("kos_ab_theme cookie is sticky for same visitor", async ({ page, context }) => {
    const slug = process.env.E2E_STORE_SLUG?.trim();
    test.skip(!slug, "Set E2E_STORE_SLUG to a published storefront with experiment enabled");

    const path = `/s/${slug}/menu`;
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const cookiesAfterFirst = await context.cookies();
    const arm1 = cookiesAfterFirst.find((c) => c.name === THEME_ARM_COOKIE)?.value;
    const vid1 = cookiesAfterFirst.find((c) => c.name === VISITOR_COOKIE)?.value;
    test.skip(!arm1 || (arm1 !== "draft" && arm1 !== "published"), "Experiment not enabled or no arm cookie");

    await page.reload();
    await page.waitForLoadState("networkidle");
    const cookiesAfterReload = await context.cookies();
    const arm2 = cookiesAfterReload.find((c) => c.name === THEME_ARM_COOKIE)?.value;
    const vid2 = cookiesAfterReload.find((c) => c.name === VISITOR_COOKIE)?.value;

    expect(arm2).toBe(arm1);
    if (vid1 && vid2) expect(vid2).toBe(vid1);
  });

  test("two fresh contexts may get different arms when traffic split < 100%", async ({ browser }) => {
    const slug = process.env.E2E_STORE_SLUG?.trim();
    test.skip(!slug, "Set E2E_STORE_SLUG");
    test.skip(
      process.env.E2E_EXPERIMENT_EXPECT_SPLIT !== "1",
      "Set E2E_EXPERIMENT_EXPECT_SPLIT=1 when draft traffic is 1–99%",
    );

    const path = `/s/${slug}/menu`;
    const arms = new Set<string>();

    for (let i = 0; i < 6; i++) {
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      await p.goto(path);
      await p.waitForLoadState("networkidle");
      const arm = (await ctx.cookies()).find((c) => c.name === THEME_ARM_COOKIE)?.value;
      if (arm === "draft" || arm === "published") arms.add(arm);
      await ctx.close();
      if (arms.size >= 2) break;
    }

    expect(arms.size).toBeGreaterThanOrEqual(2);
  });
});
