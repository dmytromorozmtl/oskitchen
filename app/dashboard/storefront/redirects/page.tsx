import Link from "next/link";

import { StorefrontRedirectsPanel } from "@/components/dashboard/storefront/storefront-redirects-panel";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { adminPagination, parseAdminPageParam } from "@/lib/storefront/pagination";
import { prisma } from "@/lib/prisma";

export default async function StorefrontRedirectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { sessionUser: user } = await getTenantActor();
  const sp = searchParams ? await searchParams : {};
  const pageNum = parseAdminPageParam(sp.page);
  const sf = await findAdminStorefront(user.id, { id: true, storeSlug: true });

  if (!sf) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Redirects</h1>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>Save the storefront overview first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const where = { storefrontId: sf.id };
  const total = await prisma.storefrontRedirect.count({ where });
  const { skip, take, page, totalPages } = adminPagination(total, pageNum);
  const redirects = await prisma.storefrontRedirect.findMany({
    where,
    orderBy: { fromPath: "asc" },
    take,
    skip,
    select: {
      id: true,
      fromPath: true,
      toPath: true,
      httpStatus: true,
      active: true,
      hitCount: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Redirects</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage vanity-host path redirects for <span className="font-mono text-sm">/s/{sf.storeSlug}</span>. After
          saving, smoke-test with <code className="rounded bg-muted px-1 text-xs">npm run smoke:storefront-redirects</code>
          .
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Redirect rules</CardTitle>
          <CardDescription>301/302, active flag, hit counts. Max chain depth enforced server-side.</CardDescription>
        </CardHeader>
        <CardContent>
          <StorefrontRedirectsPanel rows={redirects} />
          <PaginationBar
            basePath="/dashboard/storefront/redirects"
            page={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
