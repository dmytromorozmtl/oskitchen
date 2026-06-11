import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function LocationRoutesPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();

  const routes = await prisma.deliveryRoute.findMany({
    where: { userId, locationId: loc.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, title: true, status: true, createdAt: true },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-base font-semibold">Delivery routes starting from here</h2>
        {routes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No routes assigned to this location yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {routes.map((r) => (
              <li key={r.id} className="flex items-center justify-between border-b border-border/40 py-1">
                <Link href={`/dashboard/routes/${r.id}`} className="font-medium hover:underline">
                  {r.title ?? r.id.slice(0, 8)}
                </Link>
                <span className="text-xs text-muted-foreground">{r.status} · {r.createdAt.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
