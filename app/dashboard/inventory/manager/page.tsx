import type { Metadata } from "next";
import { Suspense } from "react";

import Link from "next/link";

import { InventorySkeleton } from "@/components/dashboard/inventory-skeleton";
import { InventoryManagerAsyncSection } from "@/components/inventory/inventory-manager-async-section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export const metadata: Metadata = {
  title: "AI Inventory Manager",
  description: "Waste, theft, and shrinkage signals for kitchen inventory control.",
};

export const dynamic = "force-dynamic";

export default async function InventoryManagerPage() {
  const { userId, workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">AI Inventory Manager requires a workspace</CardTitle>
          <CardDescription>
            <Link href="/dashboard/inventory/purchasing-ai" className="underline">
              Complete workspace setup
            </Link>{" "}
            to view inventory signals.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <InventorySkeleton />
        </div>
      }
    >
      <InventoryManagerAsyncSection userId={userId} />
    </Suspense>
  );
}
