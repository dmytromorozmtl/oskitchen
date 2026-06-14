import Link from "next/link";

import {
  appendCustomerSuccessNoteForm,
  markCustomerContactedForm,
} from "@/actions/customer-success";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeCustomerHealthBatch } from "@/lib/growth/customer-health";
import { buildRetentionSummariesBatch } from "@/lib/customer-health";
import { prisma } from "@/lib/prisma";

export default async function CustomerSuccessPage() {
  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    include: {
      subscription: true,
      kitchenSettings: true,
      trialState: true,
      activationState: true,
      integrationConnections: { select: { status: true } },
      _count: { select: { orders: true } },
    },
  });

  const userIds = users.map((u) => u.id);
  const [healthByUser, retentionByUser] = await Promise.all([
    computeCustomerHealthBatch(userIds),
    buildRetentionSummariesBatch(
      users.map((u) => ({
        id: u.id,
        onboardingCompleted: u.onboardingCompleted,
        trialState: u.trialState,
        subscription: u.subscription,
      })),
    ),
  ]);

  const enriched = users.map((u) => {
    const health = healthByUser.get(u.id) ?? {
      score: 0,
      status: "NEEDS_ATTENTION" as const,
      signals: {},
    };
    const retention = retentionByUser.get(u.id) ?? { summary: "Stable" };
    const integrationsErr = u.integrationConnections.filter(
      (c) => c.status === "ERROR",
    ).length;
    const trialActive =
      u.trialState?.status === "ACTIVE" && u.trialState.trialEndsAt > new Date();
    return {
      ...u,
      health,
      retention,
      integrationsErr,
      trialActive,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Customer success</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Workspace telemetry stays internal — pair notes with lifecycle emails logged in{" "}
            <code className="rounded bg-muted px-1 text-xs">lifecycle_emails</code>.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/api/growth/customer-success/export">Export CSV</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk actions</CardTitle>
          <CardDescription>
            Choose an account, append an internal note, or mark contacted (stored as lifecycle
            events).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <form action={appendCustomerSuccessNoteForm} className="space-y-3 rounded-xl border border-border/70 p-4">
            <div className="space-y-2">
              <Label htmlFor="targetUser">Workspace user</Label>
              <select
                id="targetUser"
                name="targetUserId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} · {u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input id="note" name="note" required placeholder="Follow-up agreed…" />
            </div>
            <Button type="submit" size="sm" className="rounded-full">
              Add note
            </Button>
          </form>
          <form action={markCustomerContactedForm} className="space-y-3 rounded-xl border border-border/70 p-4">
            <div className="space-y-2">
              <Label htmlFor="contactUser">Workspace user</Label>
              <select
                id="contactUser"
                name="targetUserId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} · {u.email}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm" variant="secondary" className="rounded-full">
              Mark contacted
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accounts</CardTitle>
          <CardDescription>
            Health score from usage + onboarding; retention hints surface churn risks.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enriched.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate font-medium">{row.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                  </TableCell>
                  <TableCell>{row.subscription?.plan ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {row.trialActive ? "Active" : row.trialState?.status ?? "—"}
                  </TableCell>
                  <TableCell>{row.health.score}</TableCell>
                  <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                    {row.retention.summary}
                  </TableCell>
                  <TableCell>{row._count.orders}</TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap">
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-2">
                      <a href={`mailto:${row.email}`}>Email</a>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-2">
                      <Link href="/dashboard/growth/outreach">Outreach</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
