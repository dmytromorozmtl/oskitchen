import type { PartnerOAuthScope } from "@/lib/developer/partner-oauth-scopes";

export const APP_MARKETPLACE_DEVELOPER_SHARE_PERCENT = 70;
export const APP_MARKETPLACE_PLATFORM_SHARE_PERCENT = 30;

export type AppMarketplaceListingStatus =
  | "draft"
  | "in_review"
  | "published"
  | "sandbox"
  | "suspended";

export type AppMarketplaceListing = {
  id: string;
  clientId: string;
  name: string;
  publisher: string;
  description: string;
  status: AppMarketplaceListingStatus;
  allowedScopes: PartnerOAuthScope[];
  installable: boolean;
  submittedAt: string | null;
  publishedAt: string | null;
  developerSharePercent: number;
  platformSharePercent: number;
};

export type AppMarketplaceReviewItem = AppMarketplaceListing & {
  contactEmail: string | null;
  reviewNotes: string | null;
};

export type AppMarketplaceDashboard = {
  revenueShare: {
    developerPercent: number;
    platformPercent: number;
    summary: string;
  };
  publishedApps: AppMarketplaceListing[];
  mySubmissions: AppMarketplaceListing[];
  reviewQueue: AppMarketplaceReviewItem[];
  canReview: boolean;
  stats: {
    publishedCount: number;
    inReviewCount: number;
    myAppsCount: number;
  };
};
