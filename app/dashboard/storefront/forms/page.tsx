import Link from "next/link";

import { archiveStorefrontFormFormAction, linkStorefrontFormsFormAction } from "@/actions/storefront-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { requireStorefrontManagePage } from "@/lib/storefront/storefront-page-access";

export default async function StorefrontFormsAdminPage() {
  const manageAccess = await requireStorefrontManagePage({
    operation: "storefront.forms.view",
    route: "/dashboard/storefront/forms",
  });
  if (!manageAccess.ok) {
    return manageAccess.deny;
  }
  const { sessionUser: user } = await getTenantActor();
  const settings = await findAdminStorefront(user.id, {
    id: true,
    publicContactFormId: true,
    publicCateringFormId: true,
    forms: { orderBy: { updatedAt: "desc" }, take: 50 },
    publicContactForm: { select: { id: true, title: true } },
    publicCateringForm: { select: { id: true, title: true } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Forms</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Build public forms for contact, catering, and custom pages. Link them to Contact / Catering URLs below.
          </p>
        </div>
        {settings ? (
          <Button asChild className="rounded-full">
            <Link href="/dashboard/storefront/forms/new">New form</Link>
          </Button>
        ) : null}
      </div>

      {!settings ? (
        <Card>
          <CardHeader>
            <CardTitle>Storefront not saved</CardTitle>
            <CardDescription>Create your storefront on Overview first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Public links</CardTitle>
            <CardDescription>Choose which structured form powers /contact and /catering.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={linkStorefrontFormsFormAction} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publicContactFormId">Contact form</Label>
                <select
                  id="publicContactFormId"
                  name="publicContactFormId"
                  defaultValue={settings.publicContactFormId ?? ""}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Legacy built-in contact</option>
                  {settings.forms
                    .filter((f) => !f.archived)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title} ({f.slug})
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicCateringFormId">Catering form</Label>
                <select
                  id="publicCateringFormId"
                  name="publicCateringFormId"
                  defaultValue={settings.publicCateringFormId ?? ""}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Legacy built-in catering</option>
                  {settings.forms
                    .filter((f) => !f.archived)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title} ({f.slug})
                      </option>
                    ))}
                </select>
              </div>
              <Button type="submit" className="rounded-full sm:col-span-2">
                Save links
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {settings && settings.forms.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No forms yet</CardTitle>
            <CardDescription>Create your first structured form.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {settings && settings.forms.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>All forms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/80 rounded-xl border border-border/80 text-sm">
              {settings.forms.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <Link href={`/dashboard/storefront/forms/${f.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                      {f.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      {f.slug} · {f.formKind} {f.archived ? "· archived" : f.active ? "" : "· inactive"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={`/dashboard/storefront/forms/${f.id}/submissions`}>Submissions</Link>
                    </Button>
                    {!f.archived ? (
                      <form action={archiveStorefrontFormFormAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Archive
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
