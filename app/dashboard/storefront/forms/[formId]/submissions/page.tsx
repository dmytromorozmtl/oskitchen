import Link from "next/link";
import { notFound } from "next/navigation";

import { StorefrontFormSubmissionsTable } from "@/components/storefront/forms/storefront-form-submissions-table";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { requireStorefrontManagePage } from "@/lib/storefront/storefront-page-access";
import { prisma } from "@/lib/prisma";

export default async function StorefrontFormSubmissionsPage({ params }: { params: Promise<{ formId: string }> }) {
  const manageAccess = await requireStorefrontManagePage({
    operation: "storefront.forms.submissions",
    route: "/dashboard/storefront/forms/[formId]/submissions",
  });
  if (!manageAccess.ok) {
    return manageAccess.deny;
  }
  const { formId } = await params;
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id);
  if (!sf) notFound();
  const form = await prisma.storefrontForm.findFirst({
    where: { id: formId, storefrontId: sf.id },
    include: { submissions: { orderBy: { createdAt: "desc" }, take: 200 } },
  });
  if (!form) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="text-sm text-muted-foreground">
        <Link href={`/dashboard/storefront/forms/${form.id}`} className="text-primary underline-offset-4 hover:underline">
          ← {form.title}
        </Link>
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Submissions</h1>
      <StorefrontFormSubmissionsTable formId={form.id} submissions={form.submissions} />
    </div>
  );
}
