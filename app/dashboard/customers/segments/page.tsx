import Link from "next/link";

import { createCustomerSegmentFormAction, rebuildSegmentMembershipsFormAction } from "@/actions/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { BUILT_IN_SEGMENTS } from "@/lib/crm/customer-segments";
import { prisma } from "@/lib/prisma";

export default async function CustomerSegmentsPage() {
  const { userId } = await getTenantActor();
  const segments = await prisma.customerSegment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });

  const usedKeys = new Set(segments.map((s) => s.builtInKey).filter(Boolean));
  const available = BUILT_IN_SEGMENTS.filter((b) => !usedKeys.has(b.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Segments</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Static and rule-based groupings of customers. Use the built-in starter pack or define your own
          (rules JSON editor lands in a follow-up).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your segments</CardTitle>
          <CardDescription>{segments.length} active</CardDescription>
        </CardHeader>
        <CardContent>
          {segments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No segments yet. Add one from the starter pack below.
            </p>
          ) : (
            <ul className="space-y-2">
              {segments.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <strong>{s.name}</strong>
                    {s.builtInKey ? (
                      <Badge variant="secondary" className="ml-2 rounded-full">built-in</Badge>
                    ) : null}
                    {s.description ? <p className="text-xs text-muted-foreground">{s.description}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full">{s._count.memberships} members</Badge>
                    <form action={rebuildSegmentMembershipsFormAction}>
                      <input type="hidden" name="segmentId" value={s.id} />
                      <Button type="submit" size="sm" variant="ghost">Rebuild</Button>
                    </form>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/customers/list?segment=${encodeURIComponent(s.name)}`}>View</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Starter pack</CardTitle>
          <CardDescription>One click to add a built-in segment with its default rules.</CardDescription>
        </CardHeader>
        <CardContent>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">All starter segments are added.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {available.map((b) => (
                <li key={b.key} className="rounded-md border border-border/60 p-3">
                  <strong>{b.name}</strong>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                  <form action={createCustomerSegmentFormAction} className="mt-2">
                    <input type="hidden" name="name" value={b.name} />
                    <input type="hidden" name="description" value={b.description} />
                    <input type="hidden" name="builtInKey" value={b.key} />
                    <Button type="submit" size="sm">Add segment</Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom segment</CardTitle>
          <CardDescription>Empty static segment — assign members manually for now.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerSegmentFormAction} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={120} placeholder="e.g. Local press" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" maxLength={2000} />
            </div>
            <Button type="submit" className="rounded-full md:col-span-2">Create custom segment</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
