import { auditLog } from "@/services/audit/audit-service";

export async function auditStorefrontThemePublish(input: {
  userId: string;
  email?: string | null;
  storefrontId: string;
  storeSlug: string;
}) {
  await auditLog({
    actor: { userId: input.userId, email: input.email ?? null },
    action: "storefront.theme.publish",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_settings", id: input.storefrontId, label: input.storeSlug },
    metadata: { storeSlug: input.storeSlug },
  });
}

export async function auditStorefrontPagePublish(input: {
  userId: string;
  email?: string | null;
  pageId: string;
  pageTitle: string;
  storeSlug: string;
  published: boolean;
}) {
  await auditLog({
    actor: { userId: input.userId, email: input.email ?? null },
    action: input.published ? "storefront.page.publish" : "storefront.page.unpublish",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_page", id: input.pageId, label: input.pageTitle },
    metadata: { storeSlug: input.storeSlug },
  });
}
