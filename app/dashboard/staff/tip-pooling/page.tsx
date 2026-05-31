import Link from "next/link";

import { TipPoolRulesForm } from "@/components/dashboard/staff/tip-pool-rules-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { tipPoolRulesFromSettingsCenter } from "@/lib/labor/tip-pool-settings";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { weekStartMonday } from "@/services/labor/schedule-service";
import { loadTipPoolReport } from "@/services/labor/tip-pooling-load";
import { STAFF_ROLE_LABEL } from "@/lib/staff/staff-types";

export default async function TipPoolingPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: weekParam } = await searchParams;
  const actor = await requireWorkspacePermissionActor();
  const canManage = hasPermission(actor.granted, "schedule.manage");

  const weekStart = weekParam ? new Date(weekParam) : weekStartMonday();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [report, kitchen] = await Promise.all([
    loadTipPoolReport(actor.userId, weekStart, weekEnd),
    prisma.kitchenSettings.findUnique({
      where: { userId: actor.userId },
      select: { settingsCenterJson: true },
    }),
  ]);

  const rules = tipPoolRulesFromSettingsCenter(kitchen?.settingsCenterJson);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tip pooling</h1>
          <p className="text-sm text-muted-foreground">
            Rules engine, weekly distribution, and payout report for POS tips.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href={`?week=${prevWeek.toISOString().slice(0, 10)}`} className="rounded-md border px-2 py-1">
            ← Prev
          </Link>
          <Link href={`?week=${nextWeek.toISOString().slice(0, 10)}`} className="rounded-md border px-2 py-1">
            Next →
          </Link>
        </div>
      </div>

      <TipPoolRulesForm rules={rules} canManage={canManage} />

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tips collected</CardTitle>
            <p className="text-2xl font-semibold">${report.totalTipsCollected.toFixed(2)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pooled</CardTitle>
            <p className="text-2xl font-semibold">${report.pooledAmount.toFixed(2)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Direct (POS)</CardTitle>
            <p className="text-2xl font-semibold">${report.directTipsTotal.toFixed(2)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unassigned</CardTitle>
            <p className="text-2xl font-semibold">${report.unassignedTips.toFixed(2)}</p>
          </CardHeader>
        </Card>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {report.notes.map((note) => (
          <li key={note}>• {note}</li>
        ))}
      </ul>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Distribution · {report.fromIso} → {report.toIso}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.staffLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tip activity or eligible staff for this week.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Staff</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Hours</th>
                    <th className="px-3 py-2">Direct</th>
                    <th className="px-3 py-2">Pool share</th>
                    <th className="px-3 py-2">Total payout</th>
                  </tr>
                </thead>
                <tbody>
                  {report.staffLines.map((line) => (
                    <tr key={line.staffMemberId} className="border-t">
                      <td className="px-3 py-2 font-medium">{line.staffName}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {STAFF_ROLE_LABEL[line.roleType as keyof typeof STAFF_ROLE_LABEL] ?? line.roleType}
                      </td>
                      <td className="px-3 py-2">{line.shiftHours.toFixed(1)}</td>
                      <td className="px-3 py-2">${line.directTips.toFixed(2)}</td>
                      <td className="px-3 py-2">${line.pooledShare.toFixed(2)}</td>
                      <td className="px-3 py-2 font-semibold">${line.totalPayout.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
