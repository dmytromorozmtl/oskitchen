import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function PreferencesPage() {
  const { userId } = await getTenantActor();

  const preferences = await prisma.notificationPreference.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipient preferences</CardTitle>
          <CardDescription>
            Marketing and reminder consent overrides applied on top of <code className="rounded bg-muted px-1 text-xs">kitchen_customers.marketingConsent</code>.
            Transactional emails (order confirmation, ready, pickup) are not gated by these
            settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preferences.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No preference overrides yet</p>
              <p className="mt-1 text-xs">
                Per-customer preferences are written by the CRM when a recipient opts out via the
                unsubscribe link or the customer detail page. Defaults apply otherwise.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Subject</th>
                  <th className="px-2 py-1">Transactional</th>
                  <th className="px-2 py-1">Reminders</th>
                  <th className="px-2 py-1">Marketing</th>
                  <th className="px-2 py-1">Internal</th>
                  <th className="px-2 py-1">Muted</th>
                </tr>
              </thead>
              <tbody>
                {preferences.map((p) => (
                  <tr key={p.id} className="border-t align-top">
                    <td className="px-2 py-1 text-xs">
                      {p.customerId ? "Customer" : p.staffMemberId ? "Staff" : p.targetUserId ? "User" : "—"}
                    </td>
                    <td className="px-2 py-1 text-xs">{(p.customerId ?? p.staffMemberId ?? p.targetUserId ?? "").slice(0, 8)}</td>
                    <td className="px-2 py-1 text-xs"><PrefBadge on={p.emailTransactionalEnabled} /></td>
                    <td className="px-2 py-1 text-xs"><PrefBadge on={p.emailReminderEnabled} /></td>
                    <td className="px-2 py-1 text-xs"><PrefBadge on={p.emailMarketingEnabled} /></td>
                    <td className="px-2 py-1 text-xs"><PrefBadge on={p.internalAlertsEnabled} /></td>
                    <td className="px-2 py-1 text-xs">{p.mutedUntil ? p.mutedUntil.toISOString().slice(0, 16).replace("T", " ") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Customer-level toggles live on the{" "}
        <Link href="/dashboard/customers" className="text-primary hover:underline">customer detail page</Link>{" "}
        and respect the <code className="rounded bg-muted px-1 text-xs">marketingConsent</code> flag.
      </p>
    </div>
  );
}

function PrefBadge({ on }: { on: boolean }) {
  return (
    <Badge variant="outline" className={on ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200" : "bg-muted"}>
      {on ? "yes" : "no"}
    </Badge>
  );
}
