import { expect, type Page } from "@playwright/test";

import {
  PERMISSION_DENIED_CARD_TESTID,
  RBAC_MATRIX_OWNER_SMOKE_ROUTES,
} from "@/lib/security/rbac-matrix-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type RbacMatrixOwnerSmokeResult = {
  routesVisited: number;
  routesDenied: string[];
};

export async function runRbacMatrixOwnerSmokeFlow(page: Page): Promise<RbacMatrixOwnerSmokeResult | null> {
  await skipIfLoginRedirect(page, "RBAC matrix owner smoke requires dashboard auth");

  const routesDenied: string[] = [];
  let routesVisited = 0;

  for (const route of RBAC_MATRIX_OWNER_SMOKE_ROUTES) {
    await page.goto(route.path);

    if (page.url().includes("/login")) {
      return null;
    }

    routesVisited += 1;
    await assertNoDashboardRscFailure(page);

    const denied = page.getByTestId(PERMISSION_DENIED_CARD_TESTID);
    if (await denied.isVisible().catch(() => false)) {
      routesDenied.push(route.path);
    }
  }

  expect(routesDenied, "Owner should not see permission-denied on matrix smoke routes").toEqual([]);

  return { routesVisited, routesDenied };
}
