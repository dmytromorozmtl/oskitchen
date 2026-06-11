import { createCompanyAccountFormAction } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function CompanyAccountsPage() {
  const { userId } = await getTenantActor();
  const companies = await prisma.companyAccount.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true } },
      primaryContact: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Company accounts</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          B2B clients — office lunch, corporate catering, wholesale. Attach contacts to a company from each
          customer&apos;s detail page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a company account</CardTitle>
          <CardDescription>Quick add — full billing setup arrives later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCompanyAccountFormAction} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Billing email</Label>
              <Input id="billingEmail" name="billingEmail" type="email" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" maxLength={64} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} maxLength={4000} />
            </div>
            <Button type="submit" className="md:col-span-2 rounded-full">Save company</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No company accounts yet.</p>
          ) : (
            <ul className="space-y-2">
              {companies.map((c) => (
                <li key={c.id} className="rounded-md border border-border/60 p-3">
                  <strong>{c.name}</strong>
                  <p className="text-xs text-muted-foreground">
                    {c._count.members} member(s)
                    {c.primaryContact ? ` · primary: ${c.primaryContact.name ?? c.primaryContact.email}` : ""}
                    {c.billingEmail ? ` · ${c.billingEmail}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
