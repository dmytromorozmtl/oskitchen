import { WorkbenchSafetyCallout } from "@/components/dashboard/product-mapping/workbench-safety-callout";
import { WorkbenchSubnav } from "@/components/dashboard/product-mapping/workbench-subnav";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { prisma } from "@/lib/prisma";

export default async function ProductMappingLayout({ children }: { children: React.ReactNode }) {
  const { dataUserId } = await getTenantActor();
  const [conflictWhere, mappingWhere] = await Promise.all([
    channelConflictWhereForOwner(dataUserId),
    productMappingListWhereForOwner(dataUserId),
  ]);
  const [blockedOrderLines, openConflictMappings] = await Promise.all([
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WorkbenchSafetyCallout blockedOrderLines={blockedOrderLines} openConflictMappings={openConflictMappings} />
      <WorkbenchSubnav />
      {children}
    </div>
  );
}
