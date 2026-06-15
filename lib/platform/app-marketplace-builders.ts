import type { PartnerOAuthAppRegistryStatus } from "@prisma/client";

import type { PartnerOAuthScope } from "@/lib/developer/partner-oauth-scopes";
import {
  APP_MARKETPLACE_DEVELOPER_SHARE_PERCENT,
  APP_MARKETPLACE_PLATFORM_SHARE_PERCENT,
  type AppMarketplaceDashboard,
  type AppMarketplaceListing,
  type AppMarketplaceListingStatus,
  type AppMarketplaceReviewItem,
} from "@/lib/platform/app-marketplace-types";
import { isPartnerOAuthAppInstallable } from "@/services/platform/partner-oauth-app-registry-service";

export function mapRegistryStatusToListing(status: PartnerOAuthAppRegistryStatus): AppMarketplaceListingStatus {
  switch (status) {
    case "IN_REVIEW":
      return "in_review";
    case "PUBLISHED":
      return "published";
    case "SANDBOX":
      return "sandbox";
    case "SUSPENDED":
      return "suspended";
    default:
      return "draft";
  }
}

export function listingFromRegistryRow(row: {
  id: string;
  clientId: string;
  name: string;
  publisher: string;
  description: string;
  status: PartnerOAuthAppRegistryStatus;
  allowedScopes: string[];
  submittedAt: Date | null;
  reviewedAt: Date | null;
  contactEmail?: string | null;
  reviewNotes?: string | null;
}): AppMarketplaceListing {
  const listingStatus = mapRegistryStatusToListing(row.status);
  return {
    id: row.id,
    clientId: row.clientId,
    name: row.name,
    publisher: row.publisher,
    description: row.description,
    status: listingStatus,
    allowedScopes: row.allowedScopes as PartnerOAuthScope[],
    installable: isPartnerOAuthAppInstallable(
      row.status === "IN_REVIEW" || row.status === "DRAFT" ? "SANDBOX" : row.status,
    ),
    submittedAt: row.submittedAt?.toISOString() ?? null,
    publishedAt: row.reviewedAt?.toISOString() ?? null,
    developerSharePercent: APP_MARKETPLACE_DEVELOPER_SHARE_PERCENT,
    platformSharePercent: APP_MARKETPLACE_PLATFORM_SHARE_PERCENT,
  };
}

export function reviewItemFromRegistryRow(row: {
  id: string;
  clientId: string;
  name: string;
  publisher: string;
  description: string;
  status: PartnerOAuthAppRegistryStatus;
  allowedScopes: string[];
  submittedAt: Date | null;
  reviewedAt: Date | null;
  contactEmail: string | null;
  reviewNotes: string | null;
}): AppMarketplaceReviewItem {
  return {
    ...listingFromRegistryRow(row),
    contactEmail: row.contactEmail,
    reviewNotes: row.reviewNotes,
  };
}

export function buildAppMarketplaceDashboard(input: {
  publishedApps: AppMarketplaceListing[];
  mySubmissions: AppMarketplaceListing[];
  reviewQueue: AppMarketplaceReviewItem[];
  canReview: boolean;
}): AppMarketplaceDashboard {
  return {
    revenueShare: {
      developerPercent: APP_MARKETPLACE_DEVELOPER_SHARE_PERCENT,
      platformPercent: APP_MARKETPLACE_PLATFORM_SHARE_PERCENT,
      summary: `Developers keep ${APP_MARKETPLACE_DEVELOPER_SHARE_PERCENT}% of net app revenue; OS Kitchen retains ${APP_MARKETPLACE_PLATFORM_SHARE_PERCENT}% platform fee.`,
    },
    publishedApps: input.publishedApps,
    mySubmissions: input.mySubmissions,
    reviewQueue: input.reviewQueue,
    canReview: input.canReview,
    stats: {
      publishedCount: input.publishedApps.length,
      inReviewCount: input.reviewQueue.length,
      myAppsCount: input.mySubmissions.length,
    },
  };
}
