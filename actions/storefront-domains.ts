"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertStorefrontManageAccess } from "@/lib/storefront/require-storefront-actor";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireManageStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import {
  refreshStorefrontDomainRouting,
  runStorefrontDomainVerification,
} from "@/services/storefront/storefront-domain-verification-service";

const domainHostnameSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
    "Invalid domain format",
  );

const verifyDomainSchema = z.object({
  storefrontId: z.string().min(1),
});

export async function verifyStorefrontDomainDnsAction(): Promise<void> {
  try {
    await requireTenantActor();
    const manageDenied = await assertStorefrontManageAccess("storefront.domain.verify");
    if (manageDenied) return;
    const { sf } = await requireManageStorefrontRow(
      { id: true, storeSlug: true, customDomain: true },
      { operation: "storefront.domain.verify" },
    );
    const gate = verifyDomainSchema.safeParse({ storefrontId: sf.id });
    if (!gate.success) return;
    if (sf.customDomain?.trim()) {
      const host = domainHostnameSchema.safeParse(sf.customDomain.trim().toLowerCase());
      if (!host.success) return;
    }
    await runStorefrontDomainVerification(sf.id);
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/domains");
  } catch (e) {
    console.error(safeError(e));
  }
}

export async function refreshStorefrontDomainStatusAction(): Promise<void> {
  try {
    await requireTenantActor();
    const manageDenied = await assertStorefrontManageAccess("storefront.domain.refresh");
    if (manageDenied) return;
    const { sf } = await requireManageStorefrontRow(
      { id: true, storeSlug: true },
      { operation: "storefront.domain.refresh" },
    );
    const gate = verifyDomainSchema.safeParse({ storefrontId: sf.id });
    if (!gate.success) return;
    await refreshStorefrontDomainRouting(sf.id);
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/domains");
  } catch (e) {
    console.error(safeError(e));
  }
}
