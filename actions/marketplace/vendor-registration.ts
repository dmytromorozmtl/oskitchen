"use server";

import { revalidatePath } from "next/cache";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { VendorType } from "@prisma/client";
import {
  loadWorkspaceVendorRegistration,
  submitVendorRegistration,
} from "@/services/marketplace/vendor-registration-service";

export async function submitMarketplaceVendorRegistrationAction(input: {
  companyName: string;
  legalName: string;
  type: VendorType;
  country: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  documents?: Array<{ fileName: string; fileUrl?: string | null }>;
}) {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false as const, error: "Workspace required." };
  }
  if (!hasPermission(actor.granted, "marketplace:read")) {
    return { ok: false as const, error: "You do not have permission to register a marketplace vendor." };
  }

  if (!input.companyName.trim() || !input.legalName.trim() || !input.country.trim()) {
    return { ok: false as const, error: "Company, legal name, and country are required." };
  }
  if (!input.contactEmail.trim()) {
    return { ok: false as const, error: "Contact email is required." };
  }

  const result = await submitVendorRegistration({
    workspaceId: actor.workspaceId,
    actorUserId: actor.sessionUserId,
    actorEmail: actor.email,
    actorRole: actor.staffRoleType ?? actor.workspaceRole,
    ...input,
  });

  if (result.ok) {
    revalidatePath("/vendor/register");
    revalidatePath("/vendor/register/status");
    revalidatePath("/platform/marketplace/vendor-verification");
  }

  return result;
}

export async function getMarketplaceVendorRegistrationStatusAction() {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId || !hasPermission(actor.granted, "marketplace:read")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const registration = await loadWorkspaceVendorRegistration(actor.workspaceId);
  return { ok: true as const, registration };
}
