import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountNotificationsForm } from "@/components/dashboard/settings/account-notifications-form";
import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { readAccountNotificationPrefs } from "@/lib/account/notification-prefs";
import { prisma } from "@/lib/prisma";
import { getResendDiagnostics } from "@/lib/notifications/provider-resend";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function NotificationSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = {
    userId,
    email: profile?.email ?? session.email ?? null,
    role: (profile?.role ?? null) as string | null,
  };

  const prefs = readAccountNotificationPrefs(session.user_metadata ?? undefined);
  const canManageWorkspace = canUseSettings(actor, "manage_notifications");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Control how KitchenOS contacts you. Configure email, push, and SMS for your account.
        </p>
      </div>

      <AccountNotificationsForm initial={prefs} />

      <CardLinks />

      {canManageWorkspace ? <WorkspaceNotificationBridge userId={userId} actor={actor} /> : null}
    </div>
  );
}

function CardLinks() {
  return (
    <p className="text-sm text-muted-foreground">
      Workspace SMS and push setup:{" "}
      <Link href="/dashboard/settings/notifications/sms" className="text-primary hover:underline">
        SMS settings
      </Link>
      {" · "}
      <Link href="/dashboard/settings/notifications/push" className="text-primary hover:underline">
        Push (PWA)
      </Link>
    </p>
  );
}

async function WorkspaceNotificationBridge({
  userId,
  actor,
}: {
  userId: string;
  actor: { userId: string; email: string | null; role: string | null };
}) {
  if (!canUseSettings(actor, "manage_notifications")) notFound();

  const [rules, templates, failures, recent] = await Promise.all([
    prisma.notificationRule.count({ where: { userId } }),
    prisma.notificationTemplate.count({ where: { userId } }),
    prisma.notificationLog.count({ where: { userId, status: "FAILED" } }).catch(() => 0),
    prisma.notificationLog
      .count({
        where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
      })
      .catch(() => 0),
  ]);
  const diag = (() => {
    try {
      return getResendDiagnostics();
    } catch {
      return null;
    }
  })();

  return (
    <BridgeCard
      title="Notification Center (workspace)"
      description="Email provider, templates, reminder rules, internal alerts, logs, and retry queue for your kitchen."
      href="/dashboard/notifications"
      ctaLabel="Open Notification Center"
      status={
        diag?.sendingEnabled
          ? { label: "Provider ready", tone: "ok" }
          : { label: "Provider missing", tone: "down" }
      }
      stats={[
        {
          label: "Provider",
          value: diag?.sendingEnabled ? "Resend" : "Not configured",
          tone: diag?.sendingEnabled ? "ok" : "down",
        },
        { label: "Rules", value: rules.toString(), tone: rules > 0 ? "ok" : "warn" },
        { label: "Templates", value: templates.toString(), tone: "neutral" },
        { label: "Failures", value: failures.toString(), tone: failures > 5 ? "warn" : "ok" },
        { label: "Sent (7d)", value: recent.toString(), tone: "neutral" },
      ]}
      secondaryActions={[
        { label: "Templates", href: "/dashboard/notifications/templates" },
        { label: "Rules", href: "/dashboard/notifications/rules" },
        { label: "Retry queue", href: "/dashboard/notifications/retry" },
        { label: "Provider", href: "/dashboard/notifications/provider" },
      ]}
    />
  );
}
