import reviewChecklist from "@/config/platform/partner-app-review-checklist.json";
import type { PartnerOAuthScope } from "@/lib/developer/partner-oauth-scopes";
import {
  getPartnerOAuthAppByClientId as getConfigAppByClientId,
  listPartnerOAuthAppDefinitions as listConfigApps,
  type PartnerOAuthAppDefinition,
  type PartnerOAuthAppStatus,
} from "@/lib/oauth/partner-oauth-app-catalog";
import { prisma } from "@/lib/prisma";

export type PartnerAppReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export const INSTALLABLE_OAUTH_APP_STATUSES: PartnerOAuthAppStatus[] = ["SANDBOX", "PUBLISHED"];

export function listPartnerAppReviewChecklist(): PartnerAppReviewChecklistItem[] {
  return reviewChecklist.items as PartnerAppReviewChecklistItem[];
}

function rowToDefinition(row: {
  clientId: string;
  name: string;
  publisher: string;
  description: string;
  status: string;
  redirectUris: string[];
  allowedScopes: string[];
  embedUrl: string | null;
  embedOrigins: string[];
  honestyNote: string | null;
}): PartnerOAuthAppDefinition {
  return {
    clientId: row.clientId,
    name: row.name,
    publisher: row.publisher,
    status: row.status as PartnerOAuthAppStatus,
    description: row.description,
    redirectUris: row.redirectUris,
    allowedScopes: row.allowedScopes as PartnerOAuthScope[],
    embedUrl: row.embedUrl ?? undefined,
    embedOrigins: row.embedOrigins,
    honestyNote: row.honestyNote ?? undefined,
  };
}

export async function listMergedPartnerOAuthAppDefinitions(): Promise<PartnerOAuthAppDefinition[]> {
  const [dbRows, configApps] = await Promise.all([
    prisma.partnerOAuthAppRegistry.findMany({ orderBy: { updatedAt: "desc" } }),
    Promise.resolve(listConfigApps()),
  ]);

  const byClientId = new Map<string, PartnerOAuthAppDefinition>();
  for (const app of configApps) {
    byClientId.set(app.clientId, app);
  }
  for (const row of dbRows) {
    byClientId.set(row.clientId, rowToDefinition(row));
  }
  return [...byClientId.values()];
}

export async function getMergedPartnerOAuthAppByClientId(
  clientId: string,
): Promise<PartnerOAuthAppDefinition | null> {
  const dbRow = await prisma.partnerOAuthAppRegistry.findUnique({
    where: { clientId },
  });
  if (dbRow) return rowToDefinition(dbRow);
  return getConfigAppByClientId(clientId);
}

export function isPartnerOAuthAppInstallable(status: PartnerOAuthAppStatus): boolean {
  return INSTALLABLE_OAUTH_APP_STATUSES.includes(status);
}

export type PartnerOAuthAppRegistryView = {
  id: string;
  clientId: string;
  name: string;
  publisher: string;
  description: string;
  status: string;
  redirectUris: string[];
  allowedScopes: string[];
  embedUrl: string | null;
  embedOrigins: string[];
  contactEmail: string | null;
  reviewNotes: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  checklist: Record<string, boolean>;
};

export async function listPartnerOAuthAppRegistryRows(
  status?: string,
): Promise<PartnerOAuthAppRegistryView[]> {
  const rows = await prisma.partnerOAuthAppRegistry.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    clientId: row.clientId,
    name: row.name,
    publisher: row.publisher,
    description: row.description,
    status: row.status,
    redirectUris: row.redirectUris,
    allowedScopes: row.allowedScopes,
    embedUrl: row.embedUrl,
    embedOrigins: row.embedOrigins,
    contactEmail: row.contactEmail,
    reviewNotes: row.reviewNotes,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    checklist: (row.checklistJson as Record<string, boolean> | null) ?? {},
  }));
}
