import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { isSmsNotificationsEnabled } from "@/services/notifications/sms-service";

export default function SmsNotificationsSettingsPage() {
  const enabled = isSmsNotificationsEnabled();

  return (
    <PageShell narrow>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">SMS notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Twilio-backed SMS for order ready and delivery updates.
        </p>
      </div>
      <div className="max-w-xl space-y-4 rounded-2xl border border-border/80 bg-card p-6 text-sm">
        <p>
          Status:{" "}
          <span className={enabled ? "font-medium text-green-600" : "font-medium text-amber-600"}>
            {enabled ? "Enabled" : "Not configured"}
          </span>
        </p>
        {!enabled ? (
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Set <code className="text-xs">SMS_NOTIFICATIONS_ENABLED=true</code></li>
            <li>Set <code className="text-xs">TWILIO_ACCOUNT_SID</code>, <code className="text-xs">TWILIO_AUTH_TOKEN</code>, <code className="text-xs">TWILIO_FROM_NUMBER</code></li>
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Outbound SMS uses your Twilio account. Trigger sends from notification rules and order
            lifecycle automations.
          </p>
        )}
        <p>
          <Link href="/dashboard/settings" className="text-primary underline-offset-4 hover:underline">
            ← Back to settings
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
