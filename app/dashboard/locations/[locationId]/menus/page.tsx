import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { menuListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function LocationMenusPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();
  const menus = await prisma.menu.findMany({
    where: await menuListWhereForOwnerAnd(userId, { locationId: loc.id }),
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, published: true, active: true, createdAt: true },
    take: 100,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-base font-semibold">Menus at this location</h2>
        {menus.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No menus assigned to this location. Use Assignment tools to tag existing menus.
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {menus.map((m) => (
              <li key={m.id} className="flex items-center justify-between border-b border-border/40 py-1">
                <Link href={`/dashboard/menus/${m.id}`} className="font-medium hover:underline">{m.title}</Link>
                <span className="text-xs text-muted-foreground">
                  {m.active ? "Active" : m.published ? "Published" : "Draft"} · {m.createdAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
