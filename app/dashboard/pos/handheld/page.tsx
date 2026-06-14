import React from "react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { HandheldOrderingClient } from "@/components/pos/handheld-ordering-client";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadHandheldOrderingBootstrap } from "@/services/pos/handheld-ordering-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata: Metadata = {
  title: "Handheld POS",
  description: "Mobile-first tableside ordering — fire to KDS, tab sync, offline cash checkout.",
  manifest: "/dashboard/pos/handheld/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Waiter POS",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF5F1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

type HandheldPOSPageProps = {
  searchParams: Promise<{ tableId?: string }>;
};

export default function HandheldPOSPage(props: HandheldPOSPageProps) {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <HandheldPOSPageAsync {...props} />
    </SuspenseWave1PageBoundary>
  );
}

async function HandheldPOSPageAsync({
  searchParams,
}: HandheldPOSPageProps) {
  const { tableId } = await searchParams;
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const boot = await loadHandheldOrderingBootstrap(actor.userId);

  if (!boot.registers.length) {
    return (
      <div className="mx-auto max-w-md space-y-4 pb-20">
        <h1 className="text-xl font-bold">Handheld POS</h1>
        <p className="text-sm text-muted-foreground">Create a register before taking tableside orders.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/pos/registers">Add register</Link>
        </Button>
      </div>
    );
  }

  if (!boot.staff.length) {
    return (
      <div className="mx-auto max-w-md space-y-4 pb-20">
        <h1 className="text-xl font-bold">Handheld POS</h1>
        <p className="text-sm text-muted-foreground">Add staff to attribute handheld sales.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/staff">Open staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pb-4">
      <HandheldOrderingClient
        registers={boot.registers}
        staff={boot.staff}
        products={boot.products}
        tables={boot.tables}
        tabs={boot.tabs}
        openShiftsByRegisterId={boot.openShiftsByRegisterId}
        offlineQueueEnabled={boot.offlineQueueEnabled}
        conflictResolution={boot.conflictResolution}
        initialTableId={tableId ?? null}
      />
    </div>
  );
}
