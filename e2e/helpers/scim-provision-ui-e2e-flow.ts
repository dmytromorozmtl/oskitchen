import { randomUUID } from "crypto";

import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import { SCIM_USER_SCHEMA, SCIM_WORKSPACE_USER_EXTENSION } from "@/lib/scim/scim-constants";
import {
  generateScimBearerToken,
  hashScimBearerToken,
} from "@/lib/scim/scim-token";
import {
  SCIM_DEACTIVATE_USER_TEST_ID,
  SCIM_PROVISION_UI_E2E_FLOW_STEPS,
  SCIM_PROVISION_UI_E2E_PATH,
  SCIM_PROVISION_UI_E2E_VISIBLE_MS,
  SCIM_PROVISION_USER_ROW_TEST_ID,
  SCIM_PROVISION_USER_STATUS_TEST_ID,
  SCIM_PROVISION_USERS_PANEL_TEST_ID,
  scimUsersApiPath,
  type ScimProvisionUiE2EFlowStep,
} from "@/lib/qa/scim-provision-ui-e2e-policy";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export type ScimProvisionUiE2EFlowResult = {
  scimUserId: string;
  userName: string;
  userId: string;
  workspaceId: string;
  steps: ScimProvisionUiE2EFlowStep[];
};

async function resolveAuthedOwnerContext(): Promise<{
  ownerUserId: string;
  workspaceId: string;
} | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const profile = await prisma.userProfile.findFirst({
    where: { email },
    select: { id: true },
  });
  if (!profile) return null;
  const workspaceId = await resolveOwnerWorkspaceId(profile.id);
  return { ownerUserId: profile.id, workspaceId };
}

export async function seedScimWorkspaceForE2E(
  workspaceId: string,
  actorUserId: string,
): Promise<string> {
  const bearerToken = generateScimBearerToken();
  const tokenHash = hashScimBearerToken(bearerToken);
  const now = new Date();

  await prisma.workspaceScimSettings.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      enabled: true,
      tokenHash,
      pilotPhase: "PILOT_ACTIVE",
      configuredByUserId: actorUserId,
      configuredAt: now,
      lastRotatedAt: now,
    },
    update: {
      enabled: true,
      tokenHash,
      pilotPhase: "PILOT_ACTIVE",
      configuredByUserId: actorUserId,
      configuredAt: now,
      lastRotatedAt: now,
    },
  });

  return bearerToken;
}

export async function createScimUserViaApi(
  request: APIRequestContext,
  bearerToken: string,
  userName: string,
): Promise<{ scimUserId: string; userId: string }> {
  const res = await request.post(scimUsersApiPath(), {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/scim+json",
    },
    data: {
      schemas: [SCIM_USER_SCHEMA],
      userName,
      externalId: `e2e-${randomUUID().slice(0, 8)}`,
      active: true,
      [SCIM_WORKSPACE_USER_EXTENSION]: { role: "STAFF" },
    },
  });
  expect(res.status()).toBeGreaterThanOrEqual(200);
  expect(res.status()).toBeLessThan(300);
  const body = (await res.json()) as { id?: string; userId?: string };
  const scimUserId = body.id;
  if (!scimUserId) {
    throw new Error("SCIM create user response missing id");
  }

  const row = await prisma.scimProvisionedUser.findUnique({
    where: { id: scimUserId },
    select: { userId: true },
  });
  if (!row) {
    throw new Error("SCIM user not persisted after API create");
  }

  return { scimUserId, userId: row.userId };
}

export async function verifyScimUserOnDashboardUi(
  page: Page,
  scimUserId: string,
  userName: string,
): Promise<void> {
  await page.goto(SCIM_PROVISION_UI_E2E_PATH);
  await expect(page.getByTestId(SCIM_PROVISION_USERS_PANEL_TEST_ID)).toBeVisible({
    timeout: SCIM_PROVISION_UI_E2E_VISIBLE_MS,
  });

  const row = page.getByTestId(SCIM_PROVISION_USER_ROW_TEST_ID(scimUserId));
  await expect(row).toBeVisible({ timeout: SCIM_PROVISION_UI_E2E_VISIBLE_MS });
  await expect(row).toContainText(userName);
  await expect(page.getByTestId(SCIM_PROVISION_USER_STATUS_TEST_ID(scimUserId))).toHaveText(
    "Active",
  );
}

export async function deactivateScimUserFromUi(page: Page, scimUserId: string): Promise<void> {
  await page.getByTestId(SCIM_DEACTIVATE_USER_TEST_ID(scimUserId)).click();
  await expect(page.getByTestId(SCIM_PROVISION_USER_STATUS_TEST_ID(scimUserId))).toHaveText(
    "Revoked",
    { timeout: SCIM_PROVISION_UI_E2E_VISIBLE_MS },
  );
}

export async function assertScimUserRevokedInDb(input: {
  workspaceId: string;
  scimUserId: string;
  userId: string;
}): Promise<void> {
  const scimRow = await prisma.scimProvisionedUser.findUnique({
    where: { id: input.scimUserId },
    select: { active: true },
  });
  expect(scimRow?.active).toBe(false);

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: input.workspaceId,
        userId: input.userId,
      },
    },
  });
  expect(membership).toBeNull();
}

export async function runScimProvisionUiE2EFlow(
  page: Page,
  request: APIRequestContext,
): Promise<ScimProvisionUiE2EFlowResult> {
  const steps: ScimProvisionUiE2EFlowStep[] = [];
  const ctx = await resolveAuthedOwnerContext();
  if (!ctx) {
    test.skip(true, "E2E login user or workspace not found.");
  }

  const stamp = randomUUID().slice(0, 8);
  const userName = `e2e-scim-${stamp}@example.com`;

  await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: userName,
      fullName: `E2E SCIM ${stamp}`,
      role: "STAFF",
    },
  });

  const bearerToken = await seedScimWorkspaceForE2E(ctx.workspaceId, ctx.ownerUserId);
  steps.push("seed_scim_workspace");

  const { scimUserId, userId } = await createScimUserViaApi(request, bearerToken, userName);
  steps.push("create_user_scim_api");

  await verifyScimUserOnDashboardUi(page, scimUserId, userName);
  steps.push("verify_dashboard_ui");

  await deactivateScimUserFromUi(page, scimUserId);
  steps.push("deactivate_user_ui");

  await assertScimUserRevokedInDb({
    workspaceId: ctx.workspaceId,
    scimUserId,
    userId,
  });
  steps.push("verify_revoked");

  return {
    scimUserId,
    userName,
    userId,
    workspaceId: ctx.workspaceId,
    steps,
  };
}

export { SCIM_PROVISION_UI_E2E_FLOW_STEPS };
