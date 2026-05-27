import { StorefrontSubnav } from "@/components/dashboard/storefront-subnav";
import { StorefrontSwitcher } from "@/components/dashboard/storefront-switcher";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  listOwnerStorefronts,
  resolveOwnerStorefront,
} from "@/lib/storefront/resolve-owner-storefront";
import { requireStorefrontReadPage } from "@/lib/storefront/storefront-page-access";

export default async function StorefrontAdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireStorefrontReadPage({
    operation: "storefront.hub.layout",
    route: "/dashboard/storefront",
  });
  if (!access.ok) {
    return <div className="space-y-8">{access.deny}</div>;
  }

  const { dataUserId } = await getTenantActor();
  const owned = await listOwnerStorefronts(dataUserId);
  const active = await resolveOwnerStorefront(dataUserId);

  return (
    <div className="space-y-8">
      {owned.length > 1 && active ? (
        <StorefrontSwitcher storefronts={owned} activeId={active.id} />
      ) : null}
      <StorefrontSubnav
        canManage={access.canManage}
        canPublish={access.canPublish}
        canManageMedia={access.canManageMedia}
      />
      {children}
    </div>
  );
}
