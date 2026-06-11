import Link from "next/link";

import { PosHubMoneyPathFlowProofPanel } from "@/components/dashboard/pos/pos-hub-money-path-flow-proof-panel";
import { buildPosMoneyPathFlowProofSlice } from "@/lib/commercial/era20-pos-money-path-flow-proof-era20";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export async function PosOverviewAsyncSection({ userId }: { userId: string }) {
  const posMoneyPathProof = buildPosMoneyPathFlowProofSlice();

  const [registers, tx7] = await Promise.all([
    prisma.pOSRegister.count({ where: { userId } }),
    prisma.pOSTransaction.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
  ]);

  return (
    <>
      <PosHubMoneyPathFlowProofPanel slice={posMoneyPathProof} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Registers</CardTitle>
            <CardDescription>Configured lanes</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{registers}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>POS sales (7d)</CardTitle>
            <CardDescription>Completed POS transactions</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{tx7}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
            <CardDescription>Jump into daily use</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/pos/terminal">Open terminal</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/tabs">Open tabs</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/tablet">Tablet POS</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/mobile">Mobile POS</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/handheld">Handheld POS</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/order-hub?tab=pos">Order hub · POS tab</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/inventory/pos-impacts">Inventory impacts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
