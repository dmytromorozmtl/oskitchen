import { mergeCustomersFormAction } from "@/actions/implementation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { findDuplicateGroups } from "@/services/crm/customer-service";

export default async function CustomerDedupePage() {
  const { userId } = await getTenantActor();
  const [groups, mergeEvents] = await Promise.all([
    findDuplicateGroups({ userId }, 1000),
    prisma.customerMergeEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customer dedupe</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Possible duplicates by email, phone, normalized name, or external customer id. KitchenOS never
          auto-merges — review each group and confirm a winning record.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No duplicate candidates detected.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {groups.slice(0, 30).map(({ key, members }) => {
            const primary = members[0];
            const duplicates = members.slice(1);
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{key.replace(":", " · ")}</CardTitle>
                      <CardDescription>{members.length} possible duplicate records</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full">Needs confirmation</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {members.map((m) => (
                      <div key={m.id} className="rounded-md border border-border/60 p-2 text-sm">
                        <strong>{m.name ?? m.email}</strong>
                        <p className="text-xs text-muted-foreground">
                          {m.email} · {m.phone ?? "no phone"}
                          {m.companyName ? ` · ${m.companyName}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form action={mergeCustomersFormAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="primaryCustomerId" value={primary.id} />
                    <input type="hidden" name="mergedCustomerIds" value={duplicates.map((d) => d.id).join(",")} />
                    <Button type="submit" variant="outline" size="sm">
                      Merge {duplicates.length} into {primary.email}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Merge audit</CardTitle>
          <CardDescription>Recent confirmed merges.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-xs">
          {mergeEvents.length === 0 ? (
            <p className="text-muted-foreground">No merges recorded yet.</p>
          ) : (
            mergeEvents.map((e) => (
              <p key={e.id} className="text-muted-foreground">
                {e.createdAt.toLocaleString()} · primary <code>{e.primaryCustomerId.slice(0, 8)}</code>
              </p>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
