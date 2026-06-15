import { expect, test } from "@playwright/test";

/**
 * Publish gates — strict env + AC cards visible on dashboard when authed.
 * Run with storefront-authed project (E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD).
 */
test.describe("Theme experiment publish gates", () => {
  test("advanced dashboard shows AC1 hypergraph and AC2 prefrontal cards", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Hypergraph ZK DNA")).toBeVisible();
    await expect(page.getByText("Prefrontal organoid mesh")).toBeVisible();
  });

  test("compliance audit shows production hardening strict env section", async ({ page }) => {
    await page.goto("/dashboard/compliance/experiment-audit");
    await expect(page.getByText("Production hardening (AB+)")).toBeVisible();
    await expect(page.getByText(/Strict env:/)).toBeVisible();
  });

  test("advanced dashboard shows AE phase cards", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Pan-Pacific quantum mesh")).toBeVisible();
    await expect(page.getByText("UK DSIT algorithmic transparency")).toBeVisible();
    await expect(page.getByText("Multiverse outcome CRDT")).toBeVisible();
    await expect(page.getByText("Hypergraph L3 recursive anchor")).toBeVisible();
    await expect(page.getByText("Cerebellar motor organoid")).toBeVisible();
  });

  test("advanced dashboard shows AD phase cards", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Indo-Pacific compact")).toBeVisible();
    await expect(page.getByText("EU AI Act live registry")).toBeVisible();
    await expect(page.getByText("Cosmic web federation")).toBeVisible();
    await expect(page.getByText("Hypergraph evolution")).toBeVisible();
    await expect(page.getByText("Prefrontal ethics board")).toBeVisible();
  });

  test("advanced dashboard shows AF phase cards", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Arctic quantum mesh")).toBeVisible();
    await expect(page.getByText("NIST AI RMF live control feed")).toBeVisible();
    await expect(page.getByText("Omniverse causal graph CRDT")).toBeVisible();
    await expect(page.getByText("Hypergraph L4 meta anchor")).toBeVisible();
    await expect(page.getByText("Brainstem autonomic publish guard")).toBeVisible();
  });

  test("advanced dashboard shows AG phase cards", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Antarctic subglacial mesh")).toBeVisible();
    await expect(page.getByText("EU AI Act Art. 71 PMM live")).toBeVisible();
    await expect(page.getByText("Multiverse counterfactual CRDT")).toBeVisible();
    await expect(page.getByText("Hypergraph L5 compositional anchor")).toBeVisible();
    await expect(page.getByText("Spinal cord publish throttle")).toBeVisible();
  });
});
