import { createSupplierAction } from "@/app/dashboard/purchasing/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function SuppliersPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const suppliers = await prisma.supplier.findMany({
    where: { userId: dataUserId },
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true, purchaseOrders: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Suppliers" description="Vendor master data for PO grouping, lead times, and catalog items." />

      <Card>
        <CardHeader>
          <CardTitle>Add supplier</CardTitle>
          <CardDescription>Email sending is not wired — capture contacts for exports and PO PDFs later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSupplierAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. Sysco — Downtown" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact name</Label>
              <Input id="contactName" name="contactName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-full">
                Save supplier
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your suppliers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suppliers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suppliers yet — add one above.</p>
          ) : (
            <ul className="divide-y divide-border/80 text-sm">
              {suppliers.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">
                      {s.name}
                      {!s.active ? (
                        <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s._count.items} items · {s._count.purchaseOrders} POs
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
