import type { Metadata } from "next";

import Link from "next/link";

import { LaborManagerClient } from "@/components/labor/labor-manager-client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadLaborManagerSnapshot } from "@/services/ai/labor-manager";

export const metadata: Metadata = {
  title: "AI Labor Manager",
  description: "Staffing optimization and overtime alerts for labor cost control.",
};

export const dynamic = "force-dynamic";

export default async function LaborManagerPage() {
  const { userId, workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">AI Labor Manager requires a workspace</CardTitle>
          <CardDescription>
            <Link href="/dashboard/staff" className="underline">
              Complete workspace setup
            </Link>{" "}
            to view labor signals.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const snapshot = await loadLaborManagerSnapshot(userId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <LaborManagerClient snapshot={snapshot} />
    </div>
  );
}
