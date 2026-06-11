import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function NotificationSettingsBridgePage() {
  const { userId } = await getTenantActor();
  const settings = await prisma.kitchenSettings.findUnique({ where: { userId } });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace defaults</CardTitle>
          <CardDescription>
            These master switches live in <Link href="/dashboard/settings" className="text-primary hover:underline">Workspace settings</Link>.
            The Notification Center honors them — disabling here means the corresponding rule
            shorts to <em>skipped</em>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Toggle label="Order confirmation" on={settings?.notifyOrderConfirmation ?? false} />
          <Toggle label="Preorder reminder" on={settings?.notifyPreorderReminder ?? false} />
          <Toggle label="Pickup reminder" on={settings?.notifyPickupReminder ?? false} />
          <Toggle label="Delivery reminder" on={settings?.notifyDeliveryReminder ?? false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">From address &amp; business name</CardTitle>
          <CardDescription>
            Set the sender display name and business name in Workspace settings. The from
            address comes from <code className="rounded bg-muted px-1 text-xs">RESEND_FROM_EMAIL</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            Business name: <strong>{settings?.businessName ?? "—"}</strong>
          </p>
          <p>
            Pickup address: <span className="text-muted-foreground">{settings?.pickupAddress ?? "—"}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
      <span>{label}</span>
      <span className={`rounded px-2 py-0.5 text-xs ${on ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200" : "bg-muted"}`}>
        {on ? "on" : "off"}
      </span>
    </div>
  );
}
