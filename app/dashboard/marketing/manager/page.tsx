import type { Metadata } from "next";

import Link from "next/link";

import { MarketingManagerClient } from "@/components/marketing/marketing-manager-client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketingManagerSnapshot } from "@/services/ai/marketing-manager";

export const metadata: Metadata = {
  title: "AI Marketing Manager",
  description: "Auto campaigns and weather-driven promos for restaurant marketing.",
};

export const dynamic = "force-dynamic";

export default async function MarketingManagerPage() {
  const { userId, workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">AI Marketing Manager requires a workspace</CardTitle>
          <CardDescription>
            <Link href="/dashboard/marketing/email-campaigns" className="underline">
              Complete workspace setup
            </Link>{" "}
            to view marketing signals.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const snapshot = await loadMarketingManagerSnapshot(userId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <MarketingManagerClient snapshot={snapshot} />
    </div>
  );
}
