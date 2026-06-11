import Link from "next/link";
import { Bell, Mail } from "lucide-react";

import { ProviderModeBadge } from "@/components/dashboard/notifications/status-badge";
import { TestEmailForm } from "@/components/dashboard/notifications/test-email-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationActorScope } from "@/lib/notifications/notification-actor-scope";
import { getTenantActor } from "@/lib/scope/cached-tenant";

import { canSendEmails, getResendDiagnostics } from "@/lib/notifications/provider-resend";
import { listSystemTemplates } from "@/lib/notifications/template-registry";
import { canUseNotifications } from "@/lib/notifications/notification-permissions";
import { prisma } from "@/lib/prisma";

export default async function NotificationsOverviewPage() {
  const { userId } = await getTenantActor();
  const actor = await getNotificationActorScope();

  const diagnostics = getResendDiagnostics();
  const sendingEnabled = canSendEmails();

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [sentToday, failedToday, skippedToday, queued, ruleCount, templateCount] = await Promise.all([
    prisma.notificationLog.count({ where: { userId, status: "SENT", createdAt: { gte: since } } }),
    prisma.notificationLog.count({ where: { userId, status: "FAILED", createdAt: { gte: since } } }),
    prisma.notificationLog.count({ where: { userId, status: "SKIPPED", createdAt: { gte: since } } }),
    prisma.notificationLog.count({ where: { userId, status: { in: ["QUEUED", "RETRYING"] } } }),
    prisma.notificationRule.count({ where: { userId, enabled: true } }),
    prisma.notificationTemplate.count({ where: { userId, active: true } }),
  ]);

  const systemTemplates = listSystemTemplates().length;
  const canTest = canUseNotifications(actor, "send_test_email");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ProviderModeBadge mode={diagnostics.mode} />
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/dashboard/notifications/rules">Create rule</Link></Button>
          <Button asChild size="sm"><Link href="/dashboard/notifications/templates">Templates</Link></Button>
        </div>
      </div>

      {!sendingEnabled && (
        <Card className="border-amber-300 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-900">
              <Mail className="h-4 w-4" /> Email provider not configured
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Add <code className="rounded bg-amber-100 px-1 text-xs">RESEND_API_KEY</code> and a
              verified sender to enable outbound emails. Until then, templates and rules remain
              preview-only — nothing sends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/notifications/provider">Open provider setup</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Sent today" value={sentToday} tone="info" />
        <Kpi label="Failed today" value={failedToday} tone={failedToday > 0 ? "danger" : "neutral"} />
        <Kpi label="Skipped today" value={skippedToday} tone="neutral" />
        <Kpi label="Queued / retrying" value={queued} tone={queued > 0 ? "warning" : "neutral"} />
        <Kpi label="Active rules" value={ruleCount} tone="neutral" />
        <Kpi label="Active templates" value={templateCount} tone="neutral" />
        <Kpi label="System templates" value={systemTemplates} tone="neutral" />
        <Kpi label="Provider" value={diagnostics.mode === "RESEND" ? "Resend" : diagnostics.mode === "DEVELOPMENT_LOG_ONLY" ? "Log-only" : "Off"} tone={diagnostics.mode === "RESEND" ? "success" : "warning"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Quick test
          </CardTitle>
          <CardDescription>
            Send a rendered example of a system template to validate provider config. Variables use
            the example values from the registry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestEmailForm
            templateKey="order_confirmation"
            disabled={!sendingEnabled || !canTest}
            disabledReason={!sendingEnabled ? "Provider not configured" : !canTest ? "You don't have permission to send test emails" : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What to configure next</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Link href="/dashboard/notifications/provider" className="rounded-xl border p-3 hover:border-primary">
            <p className="font-medium">1. Provider setup</p>
            <p className="text-xs text-muted-foreground">RESEND_API_KEY, from address, webhook secret.</p>
          </Link>
          <Link href="/dashboard/notifications/templates" className="rounded-xl border p-3 hover:border-primary">
            <p className="font-medium">2. Templates</p>
            <p className="text-xs text-muted-foreground">Preview the {systemTemplates} system templates and customize per workspace.</p>
          </Link>
          <Link href="/dashboard/notifications/rules" className="rounded-xl border p-3 hover:border-primary">
            <p className="font-medium">3. Rules</p>
            <p className="text-xs text-muted-foreground">Pickup, delivery, preorder cutoff, follow-ups.</p>
          </Link>
          <Link href="/dashboard/notifications/alerts" className="rounded-xl border p-3 hover:border-primary">
            <p className="font-medium">4. Internal alerts</p>
            <p className="text-xs text-muted-foreground">Failed webhooks, unmapped SKUs, blockers.</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number | string; tone: "neutral" | "info" | "success" | "warning" | "danger" }) {
  const TONE: Record<string, string> = {
    neutral: "bg-card",
    info: "bg-sky-500/10",
    success: "bg-emerald-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-rose-500/10",
  };
  return (
    <div className={`rounded-2xl border ${TONE[tone]} p-4`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
