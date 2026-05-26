import { StorefrontSubnav } from "@/components/dashboard/storefront-subnav";
import { StorefrontSwitcher } from "@/components/dashboard/storefront-switcher";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  listOwnerStorefronts,
  resolveOwnerStorefront,
} from "@/lib/storefront/resolve-owner-storefront";

export default async function StorefrontAdminLayout({ children }: { children: React.ReactNode }) {
  const { dataUserId } = await getTenantActor();
  const owned = await listOwnerStorefronts(dataUserId);
  const active = await resolveOwnerStorefront(dataUserId);

  return (
    <div className="space-y-8">
      {owned.length > 1 && active ? (
        <StorefrontSwitcher storefronts={owned} activeId={active.id} />
      ) : null}
      <StorefrontSubnav />
      {children}
    </div>
  );
}
