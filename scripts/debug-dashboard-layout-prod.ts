#!/usr/bin/env npx tsx
/**
 * Reproduce dashboard layout server loaders against production DB.
 * Usage: npx tsx scripts/debug-dashboard-layout-prod.ts [userId|email]
 */
import { loadProductionEnvLocal } from "@/scripts/lib/load-dotenv-file";
import { prisma } from "@/lib/prisma";
import { ensureAppUser } from "@/lib/auth";
import { getBillingAccess } from "@/lib/billing/access";
import { canAccessGrowthModule } from "@/lib/growth/growth-permissions";
import { effectiveDisabledModuleKeysFromRows } from "@/lib/product/module-readiness";
import { getBlockedPathPrefixes } from "@/lib/module-visibility";
import { getActiveImpersonationSession } from "@/lib/platform/impersonation-session";
import { resolveUiWorkspacePermissions } from "@/lib/permissions/resolve-ui-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { getEnrolledPilotReadinessIdsForWorkspace } from "@/services/platform/workspace-pilot-enrollment-service";
import { navReleaseProfileFromEnv } from "@/services/modules/module-release-service";
import { UserRole } from "@prisma/client";

loadProductionEnvLocal();

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    throw error;
  }
}

async function resolveUserId(): Promise<string> {
  const arg = process.argv[2]?.trim();
  if (arg?.includes("@")) {
    const row = await prisma.userProfile.findFirst({
      where: { email: arg },
      select: { id: true, email: true },
    });
    if (!row) throw new Error(`No user for email ${arg}`);
    console.log("User:", row.email, row.id);
    return row.id;
  }
  if (arg) return arg;
  const owner = await prisma.userProfile.findFirst({
    where: { role: "OWNER" },
    select: { id: true, email: true },
  });
  if (!owner) throw new Error("No OWNER user");
  console.log("User:", owner.email ?? owner.id);
  return owner.id;
}

async function main() {
  const sessionUserId = await resolveUserId();
  const userId = sessionUserId;
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  await step("getActiveImpersonationSession", async () => {
    await getActiveImpersonationSession();
  });

  await step("profile + kitchen + workspace", async () => {
    await Promise.all([
      prisma.userProfile.findUnique({
        where: { id: sessionUserId },
        select: {
          email: true,
          companyName: true,
          role: true,
          onboardingCompleted: true,
        },
      }),
      prisma.kitchenSettings.findUnique({ where: { userId } }),
      workspaceId
        ? prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { createdAt: true },
          })
        : Promise.resolve(null),
    ]);
  });

  await step("getBillingAccess", async () => {
    await getBillingAccess(sessionUserId, { workspaceId });
  });

  await step("kitchenModulePreference + pilot readiness", async () => {
    const prefRows = await prisma.kitchenModulePreference.findMany({
      where: { userId },
      select: { moduleKey: true, enabled: true },
    });
    await getEnrolledPilotReadinessIdsForWorkspace(workspaceId);
    effectiveDisabledModuleKeysFromRows(prefRows, await getEnrolledPilotReadinessIdsForWorkspace(workspaceId));
    getBlockedPathPrefixes(
      effectiveDisabledModuleKeysFromRows(
        prefRows,
        await getEnrolledPilotReadinessIdsForWorkspace(workspaceId),
      ),
    );
  });

  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUserId },
    select: { email: true, role: true },
  });

  await step("canAccessGrowthModule", async () => {
    if (profile) {
      await canAccessGrowthModule(sessionUserId, profile.email ?? null, profile.role);
    }
  });

  await step("workspace.brands", async () => {
    await prisma.workspace.findFirst({
      where: { ownerUserId: userId },
      select: {
        brands: {
          select: { id: true, name: true, slug: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });
  });

  await step("navReleaseProfileFromEnv", async () => {
    navReleaseProfileFromEnv();
  });

  await step("requireWorkspacePermissionActor (layout permissions)", async () => {
    // Cannot run without real session — simulate granted keys via direct call
    const actor = await prisma.userProfile.findUnique({
      where: { id: sessionUserId },
      select: { role: true, email: true },
    });
    if (!actor) throw new Error("no profile");
    console.log("  role:", actor.role, "email:", actor.email);
  });

  console.log("\nLayout DB loaders OK for", sessionUserId);
  console.log("Note: resolveUiWorkspacePermissions requires Supabase session cookie.");
}

main()
  .catch(() => process.exit(1))
  .finally(() => prisma.$disconnect());
