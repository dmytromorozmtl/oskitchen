import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PosMobileClient } from "@/components/pos/pos-mobile-client";
import { Button } from "@/components/ui/button";
import { BRAND_ACCENT } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { mergePosSettings } from "@/lib/pos/pos-settings";
import {
  POS_MOBILE_POS_MANIFEST_ROUTE,
  POS_MOBILE_POS_MIN_TOUCH_PX,
} from "@/lib/pos/pos-mobile-pos-policy";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { loadPosTerminalBootstrap } from "@/services/pos/pos-session-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata: Metadata = {
  title: "Mobile POS — Phone Terminal",
  description: `Phone-as-POS with swipe-to-add and one-hand cash checkout — ${POS_MOBILE_POS_MIN_TOUCH_PX}px targets.`,
  manifest: POS_MOBILE_POS_MANIFEST_ROUTE,
  appleWebApp: {
    capable: true,
    title: "Mobile POS",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_ACCENT,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/** PAGE_LAYOUT_EXCEPTION — phone POS full-viewport chrome. */

export default function PosMobilePage() {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <PosMobilePageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function PosMobilePageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_mobile" />;
  }

  const { userId } = actor;
  const [boot, kitchen] = await Promise.all([
    loadPosTerminalBootstrap(userId),
    findOwnerKitchenSettings(userId, { posSettingsJson: true }),
  ]);
  const posSettings = mergePosSettings(kitchen?.posSettingsJson);

  const products = boot.products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    category: p.category,
  }));

  const registers = boot.registers.map((r) => ({
    id: r.id,
    name: r.name,
    locationId: r.locationId,
  }));

  const staff = boot.staff.map((s) => ({ id: s.id, name: s.name }));

  if (!registers.length) {
    return (
      <div className="mx-auto max-w-md space-y-4 pb-20">
        <h1 className="text-xl font-bold">Mobile POS</h1>
        <p className="text-sm text-muted-foreground">Create a register before selling from your phone.</p>
        <Button asChild className="min-h-12 rounded-full">
          <Link href="/dashboard/pos/registers">Add register</Link>
        </Button>
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="mx-auto max-w-md space-y-4 pb-20">
        <h1 className="text-xl font-bold">Mobile POS</h1>
        <p className="text-sm text-muted-foreground">Add staff to attribute mobile sales.</p>
        <Button asChild className="min-h-12 rounded-full">
          <Link href="/dashboard/staff">Open staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <PosMobileClient
      registers={registers}
      staff={staff}
      products={products}
      openShiftsByRegisterId={boot.openShiftsByRegisterId}
      offlineQueueEnabled={posSettings.offlineQueueEnabled}
      conflictResolution={posSettings.conflictResolution}
    />
  );
}
