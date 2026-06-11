import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function LocationBrandsPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();
  const brandWhere = await brandListWhereForOwner(userId);
  const brands = await prisma.brand.findMany({
    where: { AND: [brandWhere, { locationId: loc.id }] },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, conceptKind: true, lifecycleStatus: true },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-base font-semibold">Brands at this location</h2>
        {brands.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No brands assigned yet. Use the Assignment tools to attach brands to this location.
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {brands.map((b) => (
              <li key={b.id} className="flex items-center justify-between border-b border-border/40 py-1">
                <Link href={`/dashboard/brands`} className="font-medium hover:underline">{b.name}</Link>
                <span className="text-xs text-muted-foreground">
                  {b.conceptKind} · {b.lifecycleStatus}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
