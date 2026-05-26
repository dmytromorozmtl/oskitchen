import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveLocationFormAction } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getLocationAssignmentEvents } from "@/services/locations/location-service";

export default async function LocationSettingsPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();
  const events = await getLocationAssignmentEvents({ userId }, loc.id, 30);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent assignments</CardTitle>
          <CardDescription>Audit trail for what was attached to (or removed from) this location.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignment events yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border/40 py-1">
                  <span>
                    {e.target}{" "}
                    <code className="text-muted-foreground">{e.targetId.slice(0, 8)}</code>
                    {e.fromLocationId ? " · moved from another location" : ""}
                    {e.performedBy ? ` · ${e.performedBy}` : ""}
                  </span>
                  <span className="text-muted-foreground">{e.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
          <CardDescription>Archive this location. Existing records keep their reference; nothing is deleted.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <form action={archiveLocationFormAction}>
            <input type="hidden" name="locationId" value={loc.id} />
            <Button type="submit" variant="destructive" size="sm">Archive location</Button>
          </form>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/locations">Back to overview</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
