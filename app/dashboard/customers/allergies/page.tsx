import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { parseAllergies, parseDietaryPreferences } from "@/lib/crm/customer-privacy";
import { prisma } from "@/lib/prisma";

export default async function CustomerAllergiesPage() {
  const { userId } = await getTenantActor();
  const customers = await prisma.kitchenCustomer.findMany({
    where: {
      userId,
      OR: [
        { allergiesJson: { not: { equals: undefined } } },
        { dietaryPreferencesJson: { not: { equals: undefined } } },
      ],
    },
    orderBy: { lastOrderAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Allergy &amp; dietary register</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Customers with recorded allergies or dietary preferences. KitchenOS surfaces this information to
          kitchen / packing where operationally needed — final responsibility rests with the operator.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customers with food safety notes</CardTitle>
          <CardDescription>{customers.length} customer(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No customers with recorded allergies or dietary preferences. You can record them from any customer&apos;s
              detail page.
            </p>
          ) : (
            <ul className="space-y-2">
              {customers.map((c) => {
                const allergies = parseAllergies(c.allergiesJson);
                const dietary = parseDietaryPreferences(c.dietaryPreferencesJson);
                return (
                  <li key={c.id} className="rounded-md border border-border/60 p-3">
                    <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                      {c.displayName ?? c.name ?? c.email}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {allergies.map((a) => (
                        <Badge key={a} variant="destructive" className="rounded-full">{a}</Badge>
                      ))}
                      {dietary.map((d) => (
                        <Badge key={d} variant="secondary" className="rounded-full">{d}</Badge>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
