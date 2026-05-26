import Link from "next/link";
import { notFound } from "next/navigation";

import { updateStorefrontFormFormAction, archiveStorefrontFormFormAction } from "@/actions/storefront-forms";
import { StorefrontFormBuilder } from "@/components/storefront/forms/storefront-form-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";

export default async function EditStorefrontFormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sf = await findAdminStorefront(user.id);
  if (!sf) notFound();
  const form = await prisma.storefrontForm.findFirst({ where: { id: formId, storefrontId: sf.id } });
  if (!form) notFound();

  const initialJson = JSON.stringify(form.fieldsJson, null, 2);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/dashboard/storefront/forms" className="text-primary underline-offset-4 hover:underline">
          ← Forms
        </Link>
      </p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{form.title}</h1>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/dashboard/storefront/forms/${form.id}/submissions`}>Submissions</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit</CardTitle>
          <CardDescription>Slug and kind are fixed after creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStorefrontFormFormAction} className="space-y-4">
            <input type="hidden" name="id" value={form.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={form.title} required className="rounded-xl" />
            </div>
            <StorefrontFormBuilder initialJson={initialJson} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" value="on" defaultChecked={form.active} className="h-4 w-4 rounded border-input" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="archived" value="on" defaultChecked={form.archived} className="h-4 w-4 rounded border-input" />
              Archived
            </label>
            <Button type="submit" className="rounded-full">
              Save
            </Button>
          </form>
          {!form.archived ? (
            <form action={archiveStorefrontFormFormAction} className="mt-4 border-t border-border/80 pt-4">
              <input type="hidden" name="id" value={form.id} />
              <Button type="submit" variant="destructive" className="rounded-full">
                Archive form
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
