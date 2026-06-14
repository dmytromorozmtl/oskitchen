import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
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
import { computeCustomerHealthBatch } from "@/lib/growth/customer-health";
import { prisma } from "@/lib/prisma";

export default async function GrowthAccountsPage() {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      email: true,
      fullName: true,
      onboardingCompleted: true,
      createdAt: true,
    },
  });

  const userIds = profiles.map((p) => p.id);
  const healthByUser = await computeCustomerHealthBatch(userIds);
  const enriched = profiles.map((p) => ({
    ...p,
    health: healthByUser.get(p.id) ?? {
      score: 0,
      status: "NEEDS_ATTENTION" as const,
      signals: {},
    },
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer health</CardTitle>
        <CardDescription>
          Lightweight scoring from onboarding, orders (14d), integrations, and usage — computed on
          demand for founder review.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Joined</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {enriched.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {format(row.createdAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{row.fullName}</div>
                  <div className="text-xs text-muted-foreground">{row.email}</div>
                </TableCell>
                <TableCell>
                  {row.onboardingCompleted ? (
                    <Badge variant="secondary" className="rounded-full">
                      Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full">
                      Open
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono">{row.health.score}</TableCell>
                <TableCell className="text-xs">{row.health.status}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href="/dashboard/growth/usage"
                    className="text-xs text-primary hover:underline"
                  >
                    Usage →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
