import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LaunchBarChart } from "@/components/growth/launch-charts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

export default async function LaunchAnalyticsPage() {
  const [
    leads,
    demos,
    signups,
    onboarded,
    activated,
    integrations,
    orders,
    feedback,
    types,
  ] = await Promise.all([
    prisma.betaLead.count(),
    prisma.demoRequest.count(),
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { onboardingCompleted: true } }),
    prisma.activationState.count({ where: { activatedAt: { not: null } } }),
    prisma.integrationConnection.count({ where: { status: "CONNECTED" } }),
    prisma.order.count(),
    prisma.appFeedback.count(),
    prisma.betaLead.groupBy({
      by: ["businessType"],
      _count: { businessType: true },
    }),
  ]);

  const funnel = [
    { name: "Beta leads", value: leads },
    { name: "Demo reqs", value: demos },
    { name: "Signups", value: signups },
    { name: "Onboarded", value: onboarded },
    { name: "Activated", value: activated },
    { name: "Conn.", value: integrations },
    { name: "Orders", value: orders },
    { name: "Feedback", value: feedback },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Funnel (internal counts)</CardTitle>
          <CardDescription>
            Not a substitute for privacy-conscious analytics — cohort-quality signals from your own
            Postgres rows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LaunchBarChart data={funnel} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business types (beta leads)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((t) => (
                <TableRow key={t.businessType}>
                  <TableCell>{t.businessType}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t._count.businessType}
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
