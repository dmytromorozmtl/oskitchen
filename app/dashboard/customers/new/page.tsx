import Link from "next/link";

import { createCustomerFormAction } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CUSTOMER_SOURCE_LABEL,
  CUSTOMER_SOURCE_VALUES,
  CUSTOMER_TYPE_LABEL,
  CUSTOMER_TYPE_VALUES,
} from "@/lib/crm/customer-types";
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_VALUES } from "@/lib/crm/customer-status";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New customer</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Add a customer manually. Most customers are created automatically when an order comes in — this
            form is for proactive entry (events, catering leads, B2B, phone orders).
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/customers">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Email is required; everything else is optional and can be edited later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerFormAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" maxLength={120} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" maxLength={255} placeholder="Shown across CRM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" maxLength={64} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" name="companyName" maxLength={255} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue="INDIVIDUAL"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CUSTOMER_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{CUSTOMER_TYPE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial status</Label>
              <select
                id="status"
                name="status"
                defaultValue="NEW"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CUSTOMER_STATUS_VALUES.filter((v) => v !== "ARCHIVED").map((v) => (
                  <option key={v} value={v}>{CUSTOMER_STATUS_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <select
                id="source"
                name="source"
                defaultValue="MANUAL"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CUSTOMER_SOURCE_VALUES.map((v) => (
                  <option key={v} value={v}>{CUSTOMER_SOURCE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" maxLength={500} placeholder="vip, catering, allergy-sensitive" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} maxLength={4000} />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Create customer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
