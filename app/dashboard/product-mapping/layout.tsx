import { WorkbenchSafetyCallout } from "@/components/dashboard/product-mapping/workbench-safety-callout";
import { WorkbenchSubnav } from "@/components/dashboard/product-mapping/workbench-subnav";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { getProductMappingPageAccess } from "@/lib/product-mapping/mapping-page-access";
import { prisma } from "@/lib/prisma";

export default async function ProductMappingLayout({ children }: { children: React.ReactNode }) {
  const access = await getProductMappingPageAccess();

  let blockedOrderLines = 0;
  let openConflictMappings = 0;
  if (access.canView) {
    const [conflictWhere, mappingWhere] = await Promise.all([
      channelConflictWhereForOwner(access.userId),
      productMappingListWhereForOwner(access.userId),
    ]);
    [blockedOrderLines, openConflictMappings] = await Promise.all([
      prisma.channelConflict.count({
        where: {
          AND: [
            conflictWhere,
            { conflictType: "missing_product_mapping", status: "OPEN" },
          ],
        },
      }),
      prisma.productMapping.count({ where: { AND: [mappingWhere, { status: "CONFLICT" }] } }),
    ]);
  }

  const links = [
    { href: "/dashboard/product-mapping", label: "Overview", match: "exact" as const, visible: access.canView },
    { href: "/dashboard/product-mapping/unmapped", label: "Unmapped queue", visible: access.canView },
    { href: "/dashboard/product-mapping/suggestions", label: "Suggestions", visible: access.canView },
    { href: "/dashboard/product-mapping/approved", label: "Approved", visible: access.canView },
    { href: "/dashboard/product-mapping/conflicts", label: "Conflicts", visible: access.canView },
    { href: "/dashboard/product-mapping/bulk", label: "Bulk", visible: access.canBulk },
    { href: "/dashboard/product-mapping/modifiers", label: "Modifiers", visible: access.canModifier },
    { href: "/dashboard/product-mapping/aliases", label: "Rules / aliases", visible: access.canAlias },
    { href: "/dashboard/product-mapping/batches", label: "Import batches", visible: access.canView },
    { href: "/dashboard/product-mapping/health", label: "Sync health", visible: access.canView },
    { href: "/dashboard/product-mapping/activity", label: "Activity", visible: access.canAudit },
    { href: "/dashboard/product-mapping/settings", label: "Settings", visible: access.canView },
  ].filter((link) => link.visible);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {access.canView ? (
        <WorkbenchSafetyCallout
          blockedOrderLines={blockedOrderLines}
          openConflictMappings={openConflictMappings}
        />
      ) : null}
      <WorkbenchSubnav links={links} />
      {children}
    </div>
  );
}
