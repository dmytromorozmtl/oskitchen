import type { PartnerOAuthAppRegistryStatus } from "@prisma/client";

import {
  buildAppMarketplaceDashboard,
  listingFromRegistryRow,
  reviewItemFromRegistryRow,
} from "@/lib/platform/app-marketplace-builders";
import type { AppMarketplaceDashboard } from "@/lib/platform/app-marketplace-types";
import { prisma } from "@/lib/prisma";
import { listMergedPartnerOAuthAppDefinitions } from "@/services/platform/partner-oauth-app-registry-service";

export type { AppMarketplaceDashboard } from "@/lib/platform/app-marketplace-types";

const PUBLISHED_STATUSES: PartnerOAuthAppRegistryStatus[] = ["PUBLISHED", "SANDBOX"];

export async function loadAppMarketplaceDashboard(input: {
  userEmail: string | null;
  canReview: boolean;
}): Promise<AppMarketplaceDashboard> {
  const [registryRows, mergedApps] = await Promise.all([
    prisma.partnerOAuthAppRegistry.findMany({ orderBy: { updatedAt: "desc" } }),
    listMergedPartnerOAuthAppDefinitions(),
  ]);

  const publishedFromRegistry = registryRows
    .filter((r) => PUBLISHED_STATUSES.includes(r.status))
    .map(listingFromRegistryRow);

  const publishedFromConfig = mergedApps
    .filter((a) => a.status === "PUBLISHED" || a.status === "SANDBOX")
    .filter((a) => !registryRows.some((r) => r.clientId === a.clientId))
    .map((a) =>
      listingFromRegistryRow({
        id: `config-${a.clientId}`,
        clientId: a.clientId,
        name: a.name,
        publisher: a.publisher,
        description: a.description,
        status: a.status === "PUBLISHED" ? "PUBLISHED" : "SANDBOX",
        allowedScopes: a.allowedScopes,
        submittedAt: null,
        reviewedAt: null,
      }),
    );

  const publishedApps = [...publishedFromRegistry, ...publishedFromConfig];

  const email = input.userEmail?.trim().toLowerCase() ?? "";
  const mySubmissions = registryRows
    .filter((r) => email && r.contactEmail?.toLowerCase() === email)
    .map(listingFromRegistryRow);

  const reviewQueue = input.canReview
    ? registryRows.filter((r) => r.status === "IN_REVIEW").map(reviewItemFromRegistryRow)
    : [];

  return buildAppMarketplaceDashboard({
    publishedApps,
    mySubmissions,
    reviewQueue,
    canReview: input.canReview,
  });
}
