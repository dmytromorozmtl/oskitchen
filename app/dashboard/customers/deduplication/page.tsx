import { mergeCustomersFormAction } from "@/actions/implementation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

function normalizeName(name: string | null) {
  return (name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export default async function CustomerDeduplicationPage() {
  const { userId } = await getTenantActor();
  const [customers, mergeEvents] = await Promise.all([
    prisma.kitchenCustomer.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.customerMergeEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const groups = new Map<string, typeof customers>();
  for (const customer of customers) {
    const keys = [
      customer.email ? `email:${customer.email.toLowerCase()}` : null,
      customer.phone ? `phone:${customer.phone.replace(/\D/g, "")}` : null,
      normalizeName(customer.name) ? `name:${normalizeName(customer.name)}` : null,
    ].filter(Boolean) as string[];
    for (const key of keys) {
      const existing = groups.get(key) ?? [];
      existing.push(customer);
      groups.set(key, existing);
    }
  }
  const duplicateGroups = [...groups.entries()].filter(([, members]) => members.length > 1).slice(0, 20);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customer deduplication</h1>
        <p className="mt-2 text-muted-foreground">
          Review duplicate candidates by email, phone, or similar name. KitchenOS never auto-merges records.
        </p>
      </div>

      <div className="grid gap-4">
        {duplicateGroups.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No duplicate candidates found</CardTitle>
              <CardDescription>Import old customer CSVs first, then return here for cleanup.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {duplicateGroups.map(([key, members]) => {
          const primary = members[0];
          const duplicates = members.slice(1);
          return (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>{key.replace(":", ": ")}</CardTitle>
                    <CardDescription>{members.length} possible duplicate records</CardDescription>
                  </div>
                  <Badge variant="outline">Needs confirmation</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  {members.map((customer) => (
                    <div key={customer.id} className="rounded-lg border p-3">
                      <strong>{customer.name ?? "Unnamed"}</strong>
                      <p className="text-muted-foreground">{customer.email} · {customer.phone ?? "no phone"}</p>
                    </div>
                  ))}
                </div>
                <form action={mergeCustomersFormAction}>
                  <input type="hidden" name="primaryCustomerId" value={primary.id} />
                  <input type="hidden" name="mergedCustomerIds" value={duplicates.map((d) => d.id).join(",")} />
                  <Button type="submit" variant="outline">
                    Merge into {primary.email}
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merge audit trail</CardTitle>
          <CardDescription>Recent confirmed merges.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {mergeEvents.map((event) => (
            <p key={event.id}>{event.createdAt.toLocaleString()} · primary {event.primaryCustomerId}</p>
          ))}
          {mergeEvents.length === 0 ? <p>No merges recorded yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
