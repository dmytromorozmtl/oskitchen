import Link from "next/link";

import { createStorefrontFormFormAction } from "@/actions/storefront-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";

export default async function NewStorefrontFormPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sf = await findAdminStorefront(user.id);
  if (!sf) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">New form</h1>
        <p className="text-sm text-muted-foreground">Save Overview first.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Overview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/dashboard/storefront/forms" className="text-primary underline-offset-4 hover:underline">
          ← Forms
        </Link>
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">New form</h1>
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Fields JSON is optional — defaults are applied from the type.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStorefrontFormFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required placeholder="contact-vip" className="rounded-xl font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formKind">Type</Label>
              <select id="formKind" name="formKind" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" defaultValue="CONTACT">
                <option value="CONTACT">Contact</option>
                <option value="CATERING">Catering</option>
                <option value="WHOLESALE_INQUIRY">Wholesale</option>
                <option value="EVENT_INQUIRY">Event</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="CUSTOM_REQUEST">Custom request</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <Button type="submit" className="rounded-full">
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
