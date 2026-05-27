import Link from "next/link";

import {
  updateStorefrontBusinessSettingsFormAction,
  updateStorefrontStaffPermissionsFormAction,
} from "@/actions/storefront-settings";
import { RegionalSettingsForm } from "@/components/storefront/settings/regional-settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { decryptStorefrontWebhookSecret } from "@/lib/storefront/storefront-webhook-secret";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";
import { CartRecoveryChart } from "@/components/dashboard/storefront/cart-recovery-chart";
import { WebhookDeliveryLog } from "@/components/dashboard/storefront/webhook-delivery-log";
import {
  getStorefrontCartRecoveryDailyMetrics,
  getStorefrontCartRecoveryMetrics,
} from "@/services/storefront/storefront-cart-recovery-service";
import { getStorefrontWebhookDeliveryLog } from "@/services/storefront/webhook-delivery-log-service";

export default async function StorefrontSettingsPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const { sessionUser: user } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({ where: { id: user.id }, select: { role: true } });
  const isOwner = profile?.role === "OWNER";
  const settings = await prisma.storefrontSettings.findUnique({
        where: { id: pageAccess.access.storefront.id },
        include: {
          brand: { select: { id: true, name: true } },
          contactSubmissions: {
            orderBy: { createdAt: "desc" },
            take: 25,
          },
        },
      });
  const cartMetrics = settings ? await getStorefrontCartRecoveryMetrics(settings.id) : null;
  const cartDaily = settings ? await getStorefrontCartRecoveryDailyMetrics(settings.id, 14) : [];
  const webhookLog = settings?.pagePublishWebhookUrl
    ? await getStorefrontWebhookDeliveryLog(settings.id, { limit: 50 })
    : null;
  const pagePublishWebhookSecret = decryptStorefrontWebhookSecret(
    settings?.pagePublishWebhookSecret,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Storefront settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Contact details and legal copy shown on your public site and footer. Publishing, slug, and
          toggles stay on{" "}
          <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
            Overview
          </Link>
          . Experiment pipeline and audit:{" "}
          <Link
            href="/dashboard/storefront/settings/experiments"
            className="text-primary underline-offset-4 hover:underline"
          >
            Experiments
          </Link>
          .
        </p>
      </div>

      {!settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>
              Save the storefront once on Overview to create your row, then return here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {cartMetrics ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Abandoned cart recovery</CardTitle>
                <CardDescription>
                  Tracks opted-in checkout emails. Cron sends HTML reminders at 1h and 24h.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tracked carts</p>
                  <p className="text-2xl font-semibold">{cartMetrics.total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emailed</p>
                  <p className="text-2xl font-semibold">{cartMetrics.emailed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recovery rate</p>
                  <p className="text-2xl font-semibold">{cartMetrics.recoveryRatePercent}%</p>
                  <p className="text-xs text-muted-foreground">{cartMetrics.converted} converted</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Recovery rate (14 days)</p>
                <CartRecoveryChart data={cartDaily} />
              </div>
              </CardContent>
            </Card>
          ) : null}

          {isOwner ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Team &amp; builder access</CardTitle>
                <CardDescription>
                  Let staff edit navigation, pages, and theme drafts without publishing. Overrides the{" "}
                  <code className="rounded bg-muted px-1 text-xs">STOREFRONT_STAFF_CAN_EDIT</code> env flag when enabled here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateStorefrontStaffPermissionsFormAction} className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="staffCanEditStorefront"
                      value="on"
                      defaultChecked={settings.staffCanEditStorefront}
                      className="h-4 w-4 rounded border-input"
                    />
                    Staff can view &amp; edit drafts (nav, pages, theme)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="staffCanPublishStorefront"
                      value="on"
                      defaultChecked={settings.staffCanPublishStorefront}
                      className="h-4 w-4 rounded border-input"
                    />
                    Staff can publish theme &amp; pages
                  </label>
                  <div className="space-y-2">
                    <Label htmlFor="pagePublishWebhookUrl">Page publish webhook (Zapier)</Label>
                    <Input
                      id="pagePublishWebhookUrl"
                      name="pagePublishWebhookUrl"
                      type="url"
                      defaultValue={settings.pagePublishWebhookUrl ?? ""}
                      placeholder="https://hooks.zapier.com/..."
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fires <code className="rounded bg-muted px-1">storefront.page.published</code> with HMAC when a
                      signing secret is set (3 retries).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pagePublishWebhookSecret">Webhook signing secret</Label>
                    <Input
                      id="pagePublishWebhookSecret"
                      name="pagePublishWebhookSecret"
                      type="password"
                      autoComplete="off"
                      defaultValue={pagePublishWebhookSecret ?? ""}
                      placeholder="Optional — X-KitchenOS-Signature"
                      className="rounded-xl font-mono text-sm"
                    />
                  </div>
                  {settings.brand ? (
                    <p className="text-xs text-muted-foreground">
                      Multi-brand GTM: linked brand <strong>{settings.brand.name}</strong> ({settings.brand.id})
                    </p>
                  ) : null}
                  <Button type="submit" size="sm" className="rounded-full">
                    Save team permissions
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {settings.pagePublishWebhookUrl ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Page publish webhook log</CardTitle>
                <CardDescription>
                  Delivery attempts for <code className="rounded bg-muted px-1 text-xs">storefront.page.published</code>.
                  Only the destination host is stored — never the full URL.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookDeliveryLog entries={webhookLog?.entries ?? []} canRedeliver={isOwner} />
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Regional &amp; language</CardTitle>
              <CardDescription>Currency, default locale, and kitchen timezone for checkout rules and guest UX.</CardDescription>
            </CardHeader>
            <CardContent>
              <RegionalSettingsForm
                currency={settings.currency}
                locale={settings.locale}
                timezone={settings.timezone}
              />
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Business &amp; contact</CardTitle>
              <CardDescription>Used for customer replies, footer mailto, and privacy block.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStorefrontBusinessSettingsFormAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={settings.contactEmail ?? ""}
                    className="rounded-xl"
                    placeholder="hello@yourkitchen.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    defaultValue={settings.contactPhone ?? ""}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacyText">Privacy notice (optional)</Label>
                  <Textarea
                    id="privacyText"
                    name="privacyText"
                    rows={6}
                    defaultValue={settings.privacyText ?? ""}
                    className="rounded-xl"
                    placeholder="Short note on how you use preorder data…"
                  />
                </div>
                <Button type="submit" className="rounded-full">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Recent contact &amp; catering messages</CardTitle>
              <CardDescription>Latest submissions tied to this storefront.</CardDescription>
            </CardHeader>
            <CardContent>
              {settings.contactSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <ul className="divide-y divide-border/80 rounded-xl border border-border/80 text-sm">
                  {settings.contactSubmissions.map((s) => (
                    <li key={s.id} className="space-y-1 px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.type} · {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                      <p className="line-clamp-3 text-muted-foreground">{s.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
