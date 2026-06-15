import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { evaluateWorkspaceSsoRuntimeGate } from "@/lib/enterprise/workspace-sso-foundation";
import {
  buildSsoAuthCallbackUrl,
  resolveWorkspaceSsoLoginTarget,
} from "@/lib/enterprise/workspace-sso-login-initiate";
import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";
import { parseSsoLoginWorkspaceId } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import { SSO_LOGIN_WORKSPACE_QUERY_PARAM } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18-policy";

import {
  readSsoIdpStagingPrerequisiteInput,
  skipSsoIdpStagingIfNotReady,
} from "./helpers/sso-idp-staging-ready";

/**
 * SSO IdP smoke E2E — contract (always) + staging reachability (vault gated).
 *
 * Full IdP browser login (Okta / Entra / Auth0) remains operator-driven per
 * `docs/sso-idp-smoke-test-plan.md` L3 — this spec validates wiring, denial paths,
 * and staging prerequisites without faking PASS when secrets are missing.
 *
 * @see docs/sso-idp-smoke-test-plan.md
 * @see scripts/smoke-enterprise-sso-idp-staging-era17.ts
 */

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

test.describe("SSO IdP smoke (contract — no vault)", () => {
  test("era17 policy id matches staging smoke plan", () => {
    expect(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-idp-staging-smoke-v1",
    );
  });

  test("SSO callback URL carries workspace query param", () => {
    const url = buildSsoAuthCallbackUrl({
      workspaceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      nextPath: "/dashboard/today",
    });
    expect(url).toContain("sso_workspace_id=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(url).toContain("next=");
  });

  test("parseSsoLoginWorkspaceId reads pilot admin link query param", () => {
    const workspaceId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const parsed = parseSsoLoginWorkspaceId({
      get: (name) => (name === SSO_LOGIN_WORKSPACE_QUERY_PARAM ? workspaceId : null),
    });
    expect(parsed).toBe(workspaceId);
  });

  test("evaluateWorkspaceSsoRuntimeGate denies PILOT_CONFIGURED without activation", () => {
    const gate = evaluateWorkspaceSsoRuntimeGate({
      enabled: false,
      idpVendor: "OKTA",
      allowedEmailDomains: ["pilot.example.com"],
      pilotPhase: "PILOT_CONFIGURED",
      breakGlassOwnerEnabled: true,
      supabaseSsoProviderRef: "okta-pilot",
      loginHintDomain: null,
    });
    expect(gate.allowed).toBe(false);
  });

  test("/login exposes enterprise SSO pilot entry", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /^Welcome back$/i })).toBeVisible({
      timeout: 60_000,
    });
    const entry = page.getByTestId("sso-login-entry");
    await expect(entry).toBeVisible();
    await expect(entry.getByText(/Enterprise SSO \(pilot\)/i)).toBeVisible();
    await expect(page.getByTestId("sso-workspace-id-input")).toBeVisible();
    await expect(page.getByTestId("sso-login-submit")).toBeVisible();
  });

  test("unknown workspace UUID shows workspace-not-found recovery on submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("sso-workspace-id-input").fill(randomUUID());
    await page.getByTestId("sso-login-submit").click();
    await expect(page.getByTestId("sso-login-error-recovery-strip")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Workspace not found/i)).toBeVisible();
  });
});

test.describe("SSO IdP login denial (DATABASE_URL)", () => {
  test("resolveWorkspaceSsoLoginTarget returns not_configured for workspace without SSO row", async () => {
    test.skip(!hasDb, "DATABASE_URL required for SSO denial E2E");

    const suffix = randomUUID().slice(0, 8);
    const owner = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `sso-denial-${suffix}@e2e.test`,
        fullName: "SSO Denial Probe",
        role: "OWNER",
      },
    });
    const workspace = await prisma.workspace.create({
      data: { name: `SSO denial WS ${suffix}`, ownerUserId: owner.id },
    });

    try {
      const target = await resolveWorkspaceSsoLoginTarget(workspace.id);
      expect(target.ok).toBe(false);
      if (!target.ok) {
        expect(target.reason).toBe("not_configured");
      }
    } finally {
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.delete({ where: { id: owner.id } }).catch(() => undefined);
    }
  });

  test("workspace without SSO settings shows not-configured recovery in browser", async ({
    page,
  }) => {
    test.skip(!hasDb, "DATABASE_URL required for SSO denial E2E");

    const suffix = randomUUID().slice(0, 8);
    const owner = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `sso-browser-denial-${suffix}@e2e.test`,
        fullName: "SSO Browser Denial",
        role: "OWNER",
      },
    });
    const workspace = await prisma.workspace.create({
      data: { name: `SSO browser denial WS ${suffix}`, ownerUserId: owner.id },
    });

    try {
      await page.goto("/login");
      await page.getByTestId("sso-workspace-id-input").fill(workspace.id);
      await page.getByTestId("sso-login-submit").click();
      await expect(page.getByTestId("sso-login-error-recovery-strip")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText(/SSO not configured yet/i)).toBeVisible();
    } finally {
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.delete({ where: { id: owner.id } }).catch(() => undefined);
    }
  });
});

test.describe("SSO IdP staging smoke (vault gated)", () => {
  test.beforeEach(() => {
    skipSsoIdpStagingIfNotReady();
  });

  test("staging /api/health responds ok", async ({ request }) => {
    const baseUrl = readSsoIdpStagingPrerequisiteInput().stagingBaseUrl!;
    const res = await request.get(`${baseUrl.replace(/\/$/, "")}/api/health`);
    expect(res.ok()).toBe(true);
    const body = (await res.json()) as { status?: string };
    expect(body.status).toMatch(/ok|degraded/i);
  });

  test("staging /login is reachable with SSO pilot entry", async ({ page }) => {
    const { stagingBaseUrl } = readSsoIdpStagingPrerequisiteInput();
    await page.goto(`${stagingBaseUrl!.replace(/\/$/, "")}/login`);
    await expect(page.getByTestId("sso-login-entry")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("sso-workspace-id-input")).toBeVisible();
  });

  test("staging pilot workspace link pre-fills workspace id input", async ({ page }) => {
    const { stagingBaseUrl, workspaceId } = readSsoIdpStagingPrerequisiteInput();
    const loginUrl = `${stagingBaseUrl!.replace(/\/$/, "")}/login?${SSO_LOGIN_WORKSPACE_QUERY_PARAM}=${encodeURIComponent(workspaceId!)}`;
    await page.goto(loginUrl);
    await expect(page.getByTestId("sso-workspace-id-input")).toHaveValue(workspaceId!, {
      timeout: 60_000,
    });
    await expect(page.getByText(/Pre-filled from your pilot admin link/i)).toBeVisible();
  });

  test("staging rejects foreign workspace UUID without IdP redirect", async ({ page }) => {
    const { stagingBaseUrl } = readSsoIdpStagingPrerequisiteInput();
    await page.goto(`${stagingBaseUrl!.replace(/\/$/, "")}/login`);
    await page.getByTestId("sso-workspace-id-input").fill(randomUUID());
    await page.getByTestId("sso-login-submit").click();
    await expect(page.getByTestId("sso-login-error-recovery-strip")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });
});
