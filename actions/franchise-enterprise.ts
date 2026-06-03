"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import type { FranchiseRoyaltyPeriod } from "@/lib/enterprise/franchise-types";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  loadFranchiseSuiteDashboard,
  seedFranchiseMenuEnforcementFromCatalog,
  updateFranchiseBrandControl,
  updateFranchiseMenuEnforcement,
} from "@/services/enterprise/franchise-service";

const FRANCHISE_PATH = "/dashboard/enterprise/franchise";

function revalidateFranchise() {
  revalidatePath(FRANCHISE_PATH);
  revalidatePath("/dashboard/franchise/royalties");
}

export async function refreshFranchiseSuiteDashboardAction(period?: FranchiseRoyaltyPeriod) {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await loadFranchiseSuiteDashboard({ workspaceId, period });
    revalidateFranchise();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function updateFranchiseBrandControlAction(formData: FormData) {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const enforcementMode = String(formData.get("enforcementMode") ?? "");
    const tagline = String(formData.get("tagline") ?? "").trim();

    await updateFranchiseBrandControl(workspaceId, {
      tagline: tagline || null,
      enforcementMode: enforcementMode === "strict" ? "strict" : "guided",
    });

    revalidateFranchise();
    return ok({ message: "Brand control settings saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function updateFranchiseMenuEnforcementAction(formData: FormData) {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const mode = String(formData.get("mode") ?? "") === "strict" ? "strict" : "guided";
    const rawItems = String(formData.get("lockedMenuItems") ?? "");
    const lockedMenuItems = rawItems
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    await updateFranchiseMenuEnforcement(workspaceId, {
      mode,
      lockedMenuItems,
    });

    revalidateFranchise();
    return ok({ message: "Menu enforcement rules saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function importFranchiseMenuCatalogAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const items = await seedFranchiseMenuEnforcementFromCatalog(workspaceId);
    revalidateFranchise();
    return ok({
      message: `Imported ${items.length} items from master menu.`,
      count: items.length,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
