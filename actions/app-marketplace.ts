"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireSessionUser } from "@/lib/auth";
import {
  isPartnerOAuthScope,
  PARTNER_OAUTH_SCOPES,
} from "@/lib/developer/partner-oauth-scopes";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { safeError } from "@/lib/security";
import {
  approvePartnerOAuthAppReview,
  rejectPartnerOAuthAppReview,
  submitPartnerOAuthAppForReview,
} from "@/services/platform/partner-app-review-service";
import { loadAppMarketplaceDashboard } from "@/services/platform/app-marketplace-service";

const MARKETPLACE_PATH = "/dashboard/developers";

const submitSchema = z.object({
  clientId: z.string().min(4).max(96),
  name: z.string().min(2).max(255),
  publisher: z.string().min(2).max(255),
  description: z.string().min(20).max(4000),
  redirectUris: z.string().min(8),
  allowedScopes: z.array(z.enum(PARTNER_OAUTH_SCOPES)).min(1),
  embedUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email(),
  honestyNote: z.string().max(500).optional(),
});

function revalidateMarketplace() {
  revalidatePath(MARKETPLACE_PATH);
  revalidatePath("/platform/partner-apps");
  revalidatePath("/dashboard/integrations/oauth-apps");
}

export async function submitAppMarketplaceListingAction(raw: z.infer<typeof submitSchema>) {
  try {
    const parsed = submitSchema.safeParse(raw);
    if (!parsed.success) return fail("Please complete all required fields.");

    const redirectUris = parsed.data.redirectUris
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const result = await submitPartnerOAuthAppForReview({
      clientId: parsed.data.clientId,
      name: parsed.data.name,
      publisher: parsed.data.publisher,
      description: parsed.data.description,
      redirectUris,
      allowedScopes: parsed.data.allowedScopes.filter(isPartnerOAuthScope),
      embedUrl: parsed.data.embedUrl?.trim() || null,
      embedOrigins: [],
      contactEmail: parsed.data.contactEmail,
      honestyNote: parsed.data.honestyNote?.trim() || null,
    });

    if (!result.ok) return fail(result.error);

    revalidateMarketplace();
    return ok({ clientId: result.clientId, message: "App submitted for marketplace review." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function publishAppMarketplaceListingAction(registryId: string, publishAsSandbox = false) {
  try {
    const user = await requireSessionUser();
    if (!(await isPlatformAdmin(user.id, user.email))) {
      return fail("Platform review permission required.");
    }

    const result = await approvePartnerOAuthAppReview({
      registryId,
      reviewerUserId: user.id,
      checklist: {
        security_scopes: true,
        redirect_uris_https: true,
        support_contact: true,
        pilot_workspace_test: true,
      },
      reviewNotes: "Approved via API Marketplace dashboard.",
      publishAsSandbox,
    });

    if (!result.ok) return fail(result.error);

    revalidateMarketplace();
    return ok({ message: publishAsSandbox ? "App published to SANDBOX." : "App published to marketplace." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function rejectAppMarketplaceListingAction(registryId: string, reviewNotes: string) {
  try {
    const user = await requireSessionUser();
    if (!(await isPlatformAdmin(user.id, user.email))) {
      return fail("Platform review permission required.");
    }

    if (!reviewNotes.trim()) return fail("Review notes are required.");

    const result = await rejectPartnerOAuthAppReview({
      registryId,
      reviewerUserId: user.id,
      reviewNotes,
    });

    if (!result.ok) return fail(result.error);

    revalidateMarketplace();
    return ok({ message: "Submission rejected — developer notified via review notes." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function refreshAppMarketplaceDashboardAction() {
  try {
    const user = await requireSessionUser();
    const canReview = await isPlatformAdmin(user.id, user.email);
    const dashboard = await loadAppMarketplaceDashboard({
      userEmail: user.email,
      canReview,
    });
    revalidateMarketplace();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}
