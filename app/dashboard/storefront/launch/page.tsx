import Link from "next/link";
import { Check, Circle } from "lucide-react";

import { PublishChecklistCard } from "@/components/storefront-builder/publish-checklist-card";
import { StorefrontLaunchOpsCard } from "@/components/dashboard/storefront/storefront-launch-ops-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { isStorefrontStrictLaunchEnabled } from "@/lib/storefront/launch-strict";
import {
  loadPublishChecklistForStorefront,
  publishChecklistBlocksGoLive,
} from "@/lib/storefront/launch-readiness";
import { prisma } from "@/lib/prisma";

function Item({ ok, label, href }: { ok: boolean; label: string; href: string }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {ok ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <div>
        <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
          {label}
        </Link>
      </div>
    </li>
  );
}

export default async function StorefrontLaunchPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const settings = await findAdminStorefront(user.id, {
    id: true,
    userId: true,
    storeSlug: true,
    publicName: true,
    description: true,
    logoUrl: true,
    contactEmail: true,
    contactPhone: true,
    termsText: true,
    privacyText: true,
    seoTitle: true,
    seoDescription: true,
    primaryDomainMode: true,
    subdomain: true,
    customDomain: true,
    published: true,
    enabled: true,
    activeMenuId: true,
    pickupEnabled: true,
    deliveryEnabled: true,
    onlinePaymentEnabled: true,
    payLaterOnly: true,
    currency: true,
    stripeConnectAccountId: true,
    stripeConnectChargesEnabled: true,
    stripeConnectPayoutsEnabled: true,
    stripeConnectDetailsSubmitted: true,
  });

  const [menus, productCount, publishChecklist] = settings
    ? await Promise.all([
        prisma.menu.count({ where: { userId: settings.userId } }),
        settings.activeMenuId
          ? prisma.product.count({
              where: {
                menuId: settings.activeMenuId,
                active: true,
                storefrontVisible: true,
              },
            })
          : Promise.resolve(0),
        loadPublishChecklistForStorefront(settings.id),
      ])
    : [0, 0, []];

  const publishGate = publishChecklistBlocksGoLive(publishChecklist);
  const strictLaunch = isStorefrontStrictLaunchEnabled();

  const hasMenus = menus > 0;
  const okName = Boolean(settings?.publicName?.trim());
  const okSlug = Boolean(settings?.storeSlug?.trim());
  const okMenu = Boolean(settings?.activeMenuId);
  const okProducts = productCount > 0;
  const okLogo = Boolean(settings?.logoUrl?.trim());
  const okDesc = Boolean(settings?.description?.trim());
  const okContact = Boolean(settings?.contactEmail?.trim() || settings?.contactPhone?.trim());
  const okTerms = Boolean(settings?.termsText?.trim());
  const okPrivacy = Boolean(settings?.privacyText?.trim());
  const okSeo = Boolean(settings?.seoTitle?.trim() || settings?.seoDescription?.trim());
  const domainMode = settings?.primaryDomainMode ?? "PATH";
  const okDomain =
    !settings ||
    domainMode === "PATH" ||
    (domainMode === "SUBDOMAIN" && Boolean(settings.subdomain?.trim())) ||
    (domainMode === "CUSTOM_DOMAIN" && Boolean(settings.customDomain?.trim()));
  const okPublished = Boolean(settings?.published && settings?.enabled);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Launch checklist</h1>
        <p className="mt-2 text-muted-foreground">
          Work through these items before inviting customers. Publish checklist items block theme publish and the public
          &quot;Published&quot; toggle until navigation, theme snapshot, and sections are valid.
        </p>
        {strictLaunch ? (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            <strong>Strict launch</strong> is on (<code className="text-xs">STOREFRONT_STRICT_LAUNCH=1</code>) — active
            menu, visible products, and pickup or delivery are also required to publish.
          </p>
        ) : null}
      </div>

      {publishGate.blocked ? (
        <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive">Go-live gates open</CardTitle>
            <CardDescription>
              Complete the publish checklist below before publishing theme or enabling the public storefront.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc text-sm text-destructive">
              {publishGate.failing.map((f) => (
                <li key={f.id}>
                  {f.label}
                  {f.href ? (
                    <>
                      {" "}
                      <Link href={f.href} className="underline underline-offset-2">
                        Fix
                      </Link>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-500/40 bg-emerald-500/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">Publish gates passed</CardTitle>
            <CardDescription>Theme publish and storefront visibility are unblocked by the quality checklist.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Storefront not configured</CardTitle>
            <CardDescription>Save the overview first, then return here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/storefront" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Open overview →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {!hasMenus && settings ? (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-sm">
          <CardHeader>
            <CardTitle>Menus required</CardTitle>
            <CardDescription>
              Create a service menu in Menu Center first, then return to the storefront tabs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/menus" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Open Menu Center →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {settings ? (
        <StorefrontLaunchOpsCard settings={settings} />
      ) : null}

      {settings ? <PublishChecklistCard items={publishChecklist} showBlockerBanner={false} /> : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Business readiness</CardTitle>
          <CardDescription>Green checks reflect current settings for the active storefront.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <Item ok={okName} label="Business / public name" href="/dashboard/storefront" />
            <Item ok={okSlug} label="URL slug saved" href="/dashboard/storefront" />
            <Item ok={okLogo} label="Logo uploaded" href="/dashboard/storefront/theme" />
            <Item ok={okDesc} label="Short description" href="/dashboard/storefront" />
            <Item ok={okMenu} label="Active menu selected" href="/dashboard/storefront/menu" />
            <Item ok={okProducts} label="Visible products on active menu" href="/dashboard/storefront/products" />
            <Item
              ok={Boolean(settings?.pickupEnabled || settings?.deliveryEnabled)}
              label="Pickup or delivery enabled"
              href="/dashboard/storefront/fulfillment"
            />
            <Item ok={okContact} label="Contact email or phone" href="/dashboard/storefront/settings" />
            <Item ok={okTerms} label="Checkout terms text" href="/dashboard/storefront" />
            <Item ok={okPrivacy} label="Privacy notice" href="/dashboard/storefront/settings" />
            <Item ok={okSeo} label="SEO title or description" href="/dashboard/storefront/seo" />
            <Item ok={okDomain} label="Domain mode & hostname" href="/dashboard/storefront/domains" />
            <Item ok={okPublished} label="Storefront enabled & published" href="/dashboard/storefront" />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
