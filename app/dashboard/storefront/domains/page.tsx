import Link from "next/link";

import { updateStorefrontCustomDomainSettingsFormAction } from "@/actions/storefront-pillar-settings";
import { DomainVerificationCard } from "@/components/storefront/domains/domain-verification-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { prisma } from "@/lib/prisma";

export default async function StorefrontDomainsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const settings = await findAdminStorefront(user.id);
  const root = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN ?? "your-platform-domain.com";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Domains</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          DNS is not automatic: add hostnames in your hosting provider and matching records at your DNS registrar. This tab
          shows what KitchenOS has saved for your workspace.
        </p>
      </div>

      {settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Current configuration</CardTitle>
            <CardDescription>Aligned with Overview → primary domain mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Mode:</span>{" "}
              <span className="font-mono">{settings.primaryDomainMode}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Path URL:</span>{" "}
              <span className="break-all font-mono text-xs">
                {SITE_URL.replace(/\/$/, "")}/s/{settings.storeSlug}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Subdomain label:</span>{" "}
              <span className="font-mono">{settings.subdomain || "—"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Custom domain:</span>{" "}
              <span className="break-all font-mono text-xs">{settings.customDomain || "—"}</span>
            </p>
            {settings.customDomainStatus ? (
              <p>
                <span className="text-muted-foreground">Domain status:</span>{" "}
                <span className="font-mono">{settings.customDomainStatus}</span>
              </p>
            ) : null}
            {settings.customDomainLastCheckedAt ? (
              <p>
                <span className="text-muted-foreground">Last DNS check:</span>{" "}
                <span className="font-mono text-xs">{settings.customDomainLastCheckedAt.toLocaleString()}</span>
              </p>
            ) : null}
            {settings.customDomainLastError ? (
              <p className="text-xs text-amber-800 dark:text-amber-200">{settings.customDomainLastError}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Custom hostname</CardTitle>
            <CardDescription>
              Set <strong>Primary domain mode</strong> to “Custom domain” on{" "}
              <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
                Overview
              </Link>{" "}
              first, then save the hostname your customers will type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateStorefrontCustomDomainSettingsFormAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Hostname</Label>
                <Input
                  id="customDomain"
                  name="customDomain"
                  defaultValue={settings.customDomain ?? ""}
                  placeholder="shop.yourbrand.com"
                  className="rounded-xl font-mono text-sm"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomainVerificationToken">Verification token (optional)</Label>
                <Textarea
                  id="customDomainVerificationToken"
                  name="customDomainVerificationToken"
                  rows={2}
                  defaultValue={settings.customDomainVerificationToken ?? ""}
                  placeholder="Paste TXT / provider token if your host requires it"
                  className="rounded-xl font-mono text-xs"
                />
              </div>
              <Button type="submit" className="rounded-full">
                Save hostname
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {settings ? (
        <DomainVerificationCard
          hostname={settings.customDomain}
          status={settings.customDomainStatus}
          lastCheckedAt={settings.customDomainLastCheckedAt}
          lastError={settings.customDomainLastError}
          token={settings.customDomainVerificationToken}
        />
      ) : null}

      {!settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not configured</CardTitle>
            <CardDescription>Save Overview once to attach a slug and domain mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-muted-foreground">
        <ul>
          <li>
            <strong>Path URL</strong> — always available: <span className="font-mono">{SITE_URL}/s/your-slug</span>
          </li>
          <li>
            <strong>Subdomain</strong> — set <span className="font-mono">NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN</span> to{" "}
            <span className="font-mono">{root}</span> and create DNS + hosting wildcard <span className="font-mono">*.{root}</span>.
            Save the slug portion in storefront settings.
          </li>
          <li>
            <strong>Custom domain</strong> — point <span className="font-mono">CNAME</span> to your provider target, add the
            hostname in your edge network, then store the hostname on the storefront. Middleware resolves the host using an
            internal API secured with a server secret (never exposed to browsers).
          </li>
        </ul>
        <p className="text-xs">
          See <span className="font-mono">docs/STOREFRONT_CUSTOM_DOMAINS.md</span> for full checklists.
        </p>
      </div>
    </div>
  );
}
