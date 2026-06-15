import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformPosPage() {
  await requirePlatformAccess();
  const since = new Date(Date.now() - 7 * 86400000);
  const workspaces = await prisma.userProfile.findMany({
    where: {
      posTransactions: { some: { createdAt: { gte: since } } },
    },
    select: {
      id: true,
      email: true,
      companyName: true,
      posTransactions: {
        where: { createdAt: { gte: since } },
        select: { id: true, total: true, createdAt: true, receiptNumber: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    take: 40,
  });

  return (
    <div className="space-y-6 text-zinc-50">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS operations</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Sanitized workspace slice for support — no card numbers, no provider secrets, only receipt numbers and totals
          that already exist in production tables.
        </p>
      </div>
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-zinc-50">Recent POS activity (7d)</CardTitle>
          <CardDescription className="text-zinc-400">
            Workspaces with at least one POS transaction this week.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-300">Workspace</TableHead>
                <TableHead className="text-zinc-300">Email</TableHead>
                <TableHead className="text-zinc-300">Latest receipts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((w) => (
                <TableRow key={w.id} className="border-zinc-800">
                  <TableCell className="text-sm text-zinc-200">{w.companyName ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">{w.email ?? w.id}</TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {w.posTransactions.map((t) => t.receiptNumber).join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {workspaces.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={3} className="text-zinc-500">
                    No POS transactions in the rolling 7-day window.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
