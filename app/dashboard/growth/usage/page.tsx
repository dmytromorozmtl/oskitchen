import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

export default async function GrowthUsagePage() {
  const grouped = await prisma.usageEvent.groupBy({
    by: ["eventName"],
    _count: { eventName: true },
    orderBy: { _count: { eventName: "desc" } },
    take: 40,
  });

  const hasTelemetry = grouped.some((g) => g._count.eventName > 0);

  const recentUsers = await prisma.usageEvent.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 14 * 86400000) },
    },
    distinct: ["userId"],
    select: { userId: true },
  });
  const activeIds = recentUsers.map((r) => r.userId);
  const inactive =
    activeIds.length === 0
      ? []
      : await prisma.userProfile.findMany({
          where: { id: { notIn: activeIds } },
          select: { email: true, fullName: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 25,
        });

  return (
    <div className="space-y-6">
      {!hasTelemetry ? (
        <Card>
          <CardHeader>
            <CardTitle>No product telemetry yet</CardTitle>
            <CardDescription>
              Workspace activity, feature adoption, onboarding milestones, and retention events will populate once users
              begin interacting with KitchenOS.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Feature usage (all time)</CardTitle>
          <CardDescription>
            Server-side events only — disable with{" "}
            <code className="rounded bg-muted px-1">USAGE_TRACKING_DISABLED=1</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map((g) => (
                <TableRow key={g.eventName}>
                  <TableCell className="font-mono text-xs">{g.eventName}</TableCell>
                  <TableCell className="text-right tabular-nums">{g._count.eventName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet workspaces (no usage 14d)</CardTitle>
          <CardDescription>
            Accounts without a usage event in the last two weeks — good churn-risk watchlist.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactive.map((u) => (
                <TableRow key={u.email}>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt.toISOString().slice(0, 10)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {activeIds.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No usage events in the last 14 days — tracking may be disabled or tenants are idle.
            </p>
          ) : inactive.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              All recent workspaces showed activity.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
