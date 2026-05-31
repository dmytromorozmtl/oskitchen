import { OperatorTourRestartButton } from "@/components/onboarding/operator-tour";
import { HealthOverview } from "@/components/dashboard/settings/health-overview";
import { PlatformStatusGrid, type PlatformStatusItem } from "@/components/dashboard/settings/platform-status-grid";
import { QuickActionsCard } from "@/components/dashboard/settings/quick-actions";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { getResendDiagnostics } from "@/lib/notifications/provider-resend";
import { getStripeDiagnostics } from "@/lib/billing/stripe-config";
import { prisma } from "@/lib/prisma";
import { loadSettingsHealth } from "@/services/settings/settings-health-service";

export default async function SettingsControlCenterPage() {
  const { sessionUser, userId } = await getTenantActor();
  const [profile, integrationWhere] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true, email: true },
    }),
    integrationConnectionListWhereForOwner(userId),
  ]);
  const actor = {
    userId,
    email: profile?.email ?? sessionUser.email ?? null,
    role: (profile?.role ?? null) as string | null,
  };
  const [{ sections }, integrationCount, domainCount, recentNotifFailures, ks] = await Promise.all([
    loadSettingsHealth(userId),
    prisma.integrationConnection.count({ where: integrationWhere }),
    prisma.storefrontDomain.count({ where: { userId } }),
    prisma.notificationLog.count({
      where: { userId, status: "FAILED" },
    }).catch(() => 0),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { storefrontThemeKey: true, hideKitchenOsBranding: true },
    }),
  ]);

  const stripeDiag = (() => {
    try { return getStripeDiagnostics(); } catch { return null; }
  })();
  const resendDiag = (() => {
    try { return getResendDiagnostics(); } catch { return null; }
  })();

  const platformStatus: PlatformStatusItem[] = [
    {
      key: "database",
      label: "Database",
      tone: "ok",
      description: "Supabase Postgres via Prisma — reachable for this request.",
    },
    {
      key: "supabase_auth",
      label: "Supabase auth",
      tone: "ok",
      description: "Session resolved successfully from Supabase auth.",
    },
    {
      key: "stripe",
      label: "Stripe",
      tone: stripeDiag?.configured ? "ok" : stripeDiag?.hasSecret ? "warn" : "down",
      description: stripeDiag?.configured
        ? `Live mode: ${stripeDiag.liveMode ? "yes" : "no"}. Webhook secret present.`
        : "Secret key or webhook is missing — checkout disabled.",
    },
    {
      key: "resend",
      label: "Resend",
      tone: resendDiag?.sendingEnabled ? "ok" : "down",
      description: resendDiag?.sendingEnabled
        ? `Sender: ${resendDiag.fromAddress ?? "unset"}.`
        : "RESEND_API_KEY missing — email send is disabled.",
    },
    {
      key: "cron",
      label: "Cron jobs",
      tone: "neutral",
      description: "Reminders, retries, and channel polls run on schedule.",
      detail: "Cron health is observed in Developer settings.",
    },
    {
      key: "failed_webhooks",
      label: "Webhook failures",
      tone: recentNotifFailures > 5 ? "warn" : "ok",
      description: `${recentNotifFailures} notification failures recorded.`,
    },
    {
      key: "backups",
      label: "Last backup",
      tone: "neutral",
      description: "Workspace snapshots are managed in Settings → Backups.",
    },
    {
      key: "storage",
      label: "Storage",
      tone: "neutral",
      description: "Attachments stored in Supabase Storage buckets.",
    },
    {
      key: "queue",
      label: "Queue health",
      tone: "neutral",
      description: "Notification + retry queue tracked in Notifications → Retry.",
    },
    {
      key: "domains",
      label: "Connected domains",
      tone: domainCount > 0 ? "ok" : "warn",
      description: domainCount > 0 ? `${domainCount} domain(s) connected.` : "No custom domains connected yet.",
    },
    {
      key: "integrations",
      label: "Active integrations",
      tone: integrationCount > 0 ? "ok" : "warn",
      description: `${integrationCount} integration(s) connected.`,
    },
    {
      key: "storefront_theme",
      label: "Storefront theme",
      tone: ks?.storefrontThemeKey ? "ok" : "warn",
      description: ks?.storefrontThemeKey ? `Active theme: ${ks.storefrontThemeKey}.` : "No storefront theme selected.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Control Center</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The operational brain of OS Kitchen. Configure workspace identity, operations, fulfillment, customers,
          storefront, notifications, billing, security, and the rest of your platform — all from one place.
        </p>
      </div>

      <HealthOverview sections={sections} />
      <QuickActionsCard actor={actor} />
      <div className="flex flex-wrap items-center gap-2">
        <OperatorTourRestartButton />
      </div>
      <PlatformStatusGrid items={platformStatus} />
    </div>
  );
}
