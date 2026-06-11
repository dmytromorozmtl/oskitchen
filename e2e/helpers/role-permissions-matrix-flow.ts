import { expect, type Page } from "@playwright/test";

import {
  PERMISSION_DENIED_CARD_TESTID,
  ROLE_PERMISSIONS_MATRIX_ROUTE_PROBES,
  validateRolePermissionsMatrix,
} from "@/lib/qa/role-permissions-matrix-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type RolePermissionsMatrixFlowResult = {
  steps: string[];
  matrixValid: boolean;
  routesVisited: number;
  routesDenied: string[];
};

export function runRolePermissionsMatrixContractStep(): {
  matrixValid: boolean;
  mismatchCount: number;
} {
  const result = validateRolePermissionsMatrix();
  expect(result.mismatches, "Role permissions matrix contract should match staff templates").toEqual(
    [],
  );
  return { matrixValid: result.passed, mismatchCount: result.mismatches.length };
}

export async function runRolePermissionsMatrixOwnerSmokeStep(
  page: Page,
): Promise<Pick<RolePermissionsMatrixFlowResult, "routesVisited" | "routesDenied"> | null> {
  await skipIfLoginRedirect(page, "Role permissions matrix owner smoke requires dashboard auth");

  const ownerRoutes = ROLE_PERMISSIONS_MATRIX_ROUTE_PROBES.filter(
    (probe) => probe.allowed.owner,
  );
  const routesDenied: string[] = [];
  let routesVisited = 0;

  for (const route of ownerRoutes) {
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

  expect(routesDenied, "Owner should reach all allowed matrix routes without denial").toEqual([]);

  return { routesVisited, routesDenied };
}

export async function runRolePermissionsMatrixFlow(
  page: Page,
): Promise<RolePermissionsMatrixFlowResult> {
  const steps: string[] = [];

  const contract = runRolePermissionsMatrixContractStep();
  steps.push("validate_matrix_contract");

  const ownerSmoke = await runRolePermissionsMatrixOwnerSmokeStep(page);
  if (!ownerSmoke) {
    return {
      steps,
      matrixValid: contract.matrixValid,
      routesVisited: 0,
      routesDenied: [],
    };
  }

  steps.push("owner_route_smoke");

  return {
    steps,
    matrixValid: contract.matrixValid,
    routesVisited: ownerSmoke.routesVisited,
    routesDenied: ownerSmoke.routesDenied,
  };
}
