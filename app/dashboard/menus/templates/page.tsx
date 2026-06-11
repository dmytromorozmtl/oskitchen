import Link from "next/link";

import { MenuTemplateSelector } from "@/components/onboarding/menu-template-selector";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function MenuTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await getTenantActor();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/menus" className="hover:text-foreground">
            Menus
          </Link>
          <span className="mx-2">/</span>
          Templates
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pre-built menu templates</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick a cuisine template with 5–15 starter items. Preview items, apply to your workspace,
          then edit prices and photos in Menu items.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{decodeURIComponent(error)}</p>
        ) : null}
      </div>

      <MenuTemplateSelector />
    </div>
  );
}
