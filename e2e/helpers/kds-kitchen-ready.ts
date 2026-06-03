import { expect, type Page } from "@playwright/test";

export async function assertKdsKitchenReady(page: Page): Promise<void> {
  const kitchenDisplay = page.getByRole("heading", { name: /^Kitchen Display$/i });
  const kdsPilotGate = page.getByText(/KDS v1 pilot/i);
  const permissionDenied = page.getByText(/do not have permission to view kitchen display/i);

  await expect(kitchenDisplay.or(kdsPilotGate).or(permissionDenied)).toBeVisible({
    timeout: 15_000,
  });

  if (await kdsPilotGate.isVisible()) {
    throw new Error("KDS v1 not enabled — set ENABLE_KDS_V1_CERTIFIED=true.");
  }
  if (await permissionDenied.isVisible()) {
    throw new Error("E2E user lacks kitchen.view permission.");
  }
}
