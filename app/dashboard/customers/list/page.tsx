import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { CUSTOMER_STATUS_BADGE, CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_VALUES } from "@/lib/crm/customer-status";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { CUSTOMER_SOURCE_LABEL, CUSTOMER_SOURCE_VALUES, CUSTOMER_TYPE_LABEL, CUSTOMER_TYPE_VALUES } from "@/lib/crm/customer-types";
import { parseAllergies } from "@/lib/crm/customer-privacy";
import { formatCurrency } from "@/lib/utils";
import {
  listCustomersForUser,
} from "@/services/crm/customer-service";
import { CustomerSource, CustomerStatus, CustomerType } from "@prisma/client";

export default async function CustomersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; source?: string; q?: string }>;
}) {
  const { userId } = await getTenantActor();
  const sp = await searchParams;
  const status =
    sp.status && (CUSTOMER_STATUS_VALUES as readonly string[]).includes(sp.status)
      ? (sp.status as CustomerStatus)
      : undefined;
  const type =
    sp.type && (CUSTOMER_TYPE_VALUES as readonly string[]).includes(sp.type)
      ? (sp.type as CustomerType)
      : undefined;
  const source =
    sp.source && (CUSTOMER_SOURCE_VALUES as readonly string[]).includes(sp.source)
      ? (sp.source as CustomerSource)
      : undefined;

  const customers = await listCustomersForUser(
    { userId },
    { status, type, source, search: sp.q, take: 500 },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All customers</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Filter by status, type, source, or search by name / email / phone.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>{customers.length} customer(s) match.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 md:grid-cols-5">
            <Input name="q" defaultValue={sp.q ?? ""} placeholder="Search name / email / phone…" className="md:col-span-2" />
            <select
              name="status"
              defaultValue={status ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {CUSTOMER_STATUS_VALUES.map((v) => (
                <option key={v} value={v}>{CUSTOMER_STATUS_LABEL[v]}</option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={type ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {CUSTOMER_TYPE_VALUES.map((v) => (
                <option key={v} value={v}>{CUSTOMER_TYPE_LABEL[v]}</option>
              ))}
            </select>
            <select
              name="source"
              defaultValue={source ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All sources</option>
              {CUSTOMER_SOURCE_VALUES.map((v) => (
                <option key={v} value={v}>{CUSTOMER_SOURCE_LABEL[v]}</option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground md:col-span-5"
            >
              Apply filters
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border/70">
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2 text-right">Orders</th>
                  <th className="py-2 pr-2 text-right">LTV</th>
                  <th className="py-2 pr-2">Last order</th>
                  <th className="py-2 pr-2">Source</th>
                  <th className="py-2 pr-2">Allergy</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const allergies = parseAllergies(c.allergiesJson);
                  return (
                    <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="py-2 pr-2">
                        <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:underline">
                          {c.displayName ?? c.name ?? c.email}
                        </Link>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">{c.email}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{CUSTOMER_TYPE_LABEL[c.type]}</td>
                      <td className="py-2 pr-2">
                        <Badge variant={CUSTOMER_STATUS_BADGE[c.status]} className="rounded-full">
                          {CUSTOMER_STATUS_LABEL[c.status]}
                        </Badge>
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums">{c.totalOrders}</td>
                      <td className="py-2 pr-2 text-right tabular-nums">
                        {formatCurrency(centsToDollars(c.lifetimeValueCents))}
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">{c.lastOrderAt?.toLocaleDateString() ?? "—"}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{CUSTOMER_SOURCE_LABEL[c.source]}</td>
                      <td className="py-2 pr-2">
                        {allergies.length > 0 ? (
                          <Badge variant="destructive" className="rounded-full">{allergies.length}</Badge>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No customers match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
