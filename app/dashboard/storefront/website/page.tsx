import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";

export default async function StorefrontWebsiteAdminPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const settings = await findAdminStorefront(user.id);
  const origin = SITE_URL.replace(/\/$/, "");
  const live = settings ? `${origin}/s/${settings.storeSlug}` : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Website</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A single place to see how your public site is wired — same model as Shopify’s “Online store” settings: identity,
          content, theme, and domains each have a focused tab.
        </p>
      </div>

      {!settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>Publish your store URL and business name on Overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/80 shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle>Live storefront</CardTitle>
              <CardDescription>What customers (or you, in draft) open in the browser.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <span className="break-all font-mono text-sm">{live}</span>
              <Button asChild size="sm" variant="outline" className="rounded-full gap-1">
                <a href={live!} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Identity &amp; publishing</CardTitle>
              <CardDescription>Name, slug, description, legal checkout text.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront">Overview</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Logo, colors, hero, fonts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/theme">Theme</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Team access</CardTitle>
              <CardDescription>Workspace staff permissions for storefront admin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/team">Team</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Workspace stores</CardTitle>
              <CardDescription>Link workspace, list storefronts, market vanity hosts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/workspace">Workspace</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Markets</CardTitle>
              <CardDescription>Per-market menus, hosts, and product filters.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/markets">Markets</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Catalog options</CardTitle>
              <CardDescription>Variants, modifiers, and sold-out overrides for the active menu.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/catalog">Variants &amp; modifiers</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Pages</CardTitle>
              <CardDescription>Custom landing pages and reusable sections.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/pages">Pages</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Contact &amp; footer</CardTitle>
              <CardDescription>Email, phone, privacy copy.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/storefront/settings">Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
