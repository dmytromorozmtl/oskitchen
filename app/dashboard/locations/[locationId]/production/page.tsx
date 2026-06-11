import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function LocationProductionPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();

  const batches = await prisma.productionBatch.findMany({
    where: { userId, locationId: loc.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, title: true, status: true, createdAt: true },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-base font-semibold">Production batches</h2>
        {batches.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No production batches assigned to this location yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {batches.map((b) => (
              <li key={b.id} className="flex items-center justify-between border-b border-border/40 py-1">
                <span className="font-medium">{b.title}</span>
                <span className="text-xs text-muted-foreground">{b.status} · {b.createdAt.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
