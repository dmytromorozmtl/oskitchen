import { expect, type Page } from "@playwright/test";

import {
  AUTH_E2E_MATRIX_P3_51_DASHBOARD_PATH,
  AUTH_E2E_MATRIX_P3_51_LOGIN_PATH,
  PERMISSION_DENIED_CARD_TESTID,
  type AuthE2eMatrixRoleId,
} from "@/lib/qa/auth-e2e-matrix-p3-51-policy";
import {
  resolveAuthE2eMatrixCredentials,
  routesAllowedForRole,
  validateAuthE2eMatrixP3_51,
} from "@/lib/qa/auth-e2e-matrix-p3-51-measurement";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type AuthE2eMatrixFlowResult = {
  steps: string[];
  matrixValid: boolean;
  routesVisited: number;
  routesDenied: string[];
  rolesSmokeTested: AuthE2eMatrixRoleId[];
};

export function runAuthE2eMatrixContractStep(): {
  matrixValid: boolean;
  mismatchCount: number;
} {
  const result = validateAuthE2eMatrixP3_51();
  expect(result.mismatches, "Auth E2E matrix contract should match staff templates").toEqual([]);
  return { matrixValid: result.passed, mismatchCount: result.mismatches.length };
}

export async function loginAsAuthE2eMatrixRole(
  page: Page,
  roleId: AuthE2eMatrixRoleId,
): Promise<boolean> {
  const creds = resolveAuthE2eMatrixCredentials(roleId);
  if (!creds) return false;

  await page.goto(AUTH_E2E_MATRIX_P3_51_LOGIN_PATH);
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 60_000 });

  if (page.url().includes("/onboarding")) {
    const skipSetup = page.getByRole("button", { name: /skip setup/i });
    if (await skipSetup.isVisible().catch(() => false)) {
      await skipSetup.click();
    } else {
      const skipOnboarding = page.getByRole("button", { name: /skip onboarding/i });
      if (await skipOnboarding.isVisible().catch(() => false)) {
        await skipOnboarding.click();
      }
    }
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 }).catch(() => undefined);
  }

  return page.url().includes("/dashboard");
}

export async function runAuthE2eMatrixOwnerSmokeStep(
  page: Page,
): Promise<Pick<AuthE2eMatrixFlowResult, "routesVisited" | "routesDenied"> | null> {
  await skipIfLoginRedirect(page, "Auth E2E matrix owner smoke requires dashboard auth");

  const ownerRoutes = routesAllowedForRole("owner");
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

export async function runAuthE2eMatrixRoleRouteSmokeStep(
  page: Page,
  roleId: AuthE2eMatrixRoleId,
): Promise<{ routesVisited: number; routesDenied: string[] } | null> {
  const loggedIn = await loginAsAuthE2eMatrixRole(page, roleId);
  if (!loggedIn) return null;

  await page.goto(AUTH_E2E_MATRIX_P3_51_DASHBOARD_PATH);
  if (page.url().includes("/login")) return null;

  const allowedRoutes = routesAllowedForRole(roleId);
  const routesDenied: string[] = [];
  let routesVisited = 0;

  for (const route of allowedRoutes) {
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

  return { routesVisited, routesDenied };
}

export async function runAuthE2eMatrixFlow(page: Page): Promise<AuthE2eMatrixFlowResult> {
  const steps: string[] = [];
  const rolesSmokeTested: AuthE2eMatrixRoleId[] = [];

  const contract = runAuthE2eMatrixContractStep();
  steps.push("validate_auth_matrix_contract");

  const ownerSmoke = await runAuthE2eMatrixOwnerSmokeStep(page);
  if (!ownerSmoke) {
    return {
      steps,
      matrixValid: contract.matrixValid,
      routesVisited: 0,
      routesDenied: [],
      rolesSmokeTested,
    };
  }

  steps.push("owner_login_smoke");

  let routesVisited = ownerSmoke.routesVisited;
  let routesDenied = ownerSmoke.routesDenied;

  for (const roleId of ["manager", "cashier", "chef", "driver"] as const) {
    if (!resolveAuthE2eMatrixCredentials(roleId)) continue;
    const roleSmoke = await runAuthE2eMatrixRoleRouteSmokeStep(page, roleId);
    if (!roleSmoke) continue;
    rolesSmokeTested.push(roleId);
    routesVisited += roleSmoke.routesVisited;
    routesDenied = routesDenied.concat(roleSmoke.routesDenied);
  }

  if (rolesSmokeTested.length > 0) {
    steps.push("role_route_matrix_smoke");
  }

  return {
    steps,
    matrixValid: contract.matrixValid,
    routesVisited,
    routesDenied,
    rolesSmokeTested,
  };
}
