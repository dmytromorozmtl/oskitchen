import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PosTabletClient } from "@/components/pos/pos-tablet-client";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { mergePosSettings } from "@/lib/pos/pos-settings";
import {
  POS_TABLET_POS_MANIFEST_ROUTE,
  POS_TABLET_POS_MIN_TOUCH_PX,
} from "@/lib/pos/pos-tablet-pos-policy";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { listCustomersForUser } from "@/services/crm/customer-service";
import { loadPosTerminalBootstrap } from "@/services/pos/pos-session-service";
import { BRAND_ACCENT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tablet POS — iPad & Android",
  description: `Touch-optimized counter POS for iPad and Android tablets — ${POS_TABLET_POS_MIN_TOUCH_PX}px targets, portrait and landscape.`,
  manifest: POS_TABLET_POS_MANIFEST_ROUTE,
  appleWebApp: {
    capable: true,
    title: "Tablet POS",
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

/** PAGE_LAYOUT_EXCEPTION — full-screen tablet POS chrome. */

export default async function PosTabletPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_tablet" />;
  }

  const { userId } = actor;

  const [boot, operatingMode, kitchen] = await Promise.all([
    loadPosTerminalBootstrap(userId),
    getTenantOperatingMode(userId),
    findOwnerKitchenSettings(userId, { businessType: true, posSettingsJson: true }),
  ]);
  const posSettings = mergePosSettings(kitchen?.posSettingsJson);
  const quickOrderEnabled = isDailyServiceMode(operatingMode);

  const products = boot.products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    category: p.category,
    barcode: p.barcode,
    image: p.image,
  }));

  const locationNameById = new Map(boot.locations.map((l) => [l.id, l.name]));
  const registers = boot.registers.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.locationId
      ? { id: r.locationId, name: locationNameById.get(r.locationId) ?? "Location" }
      : null,
  }));

  const staff = boot.staff.map((s) => ({ id: s.id, name: s.name }));

  const crm = await canUseFeature(userId, "customer_crm");
  const recentCustomers = crm.allowed
    ? (
        await listCustomersForUser({ userId }, { take: 10 })
      ).map((c) => ({
        id: c.id,
        email: c.email,
        label: (c.displayName?.trim() || c.name?.trim() || c.email.split("@")[0] || c.email) as string,
        phone: c.phone,
      }))
    : [];

  if (!registers.length) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Tablet POS</h1>
        <p className="text-muted-foreground">Create a register before selling on iPad or Android.</p>
        <Button asChild className="min-h-11 rounded-full">
          <Link href="/dashboard/pos/registers">Add register</Link>
        </Button>
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Tablet POS</h1>
        <p className="text-muted-foreground">Add at least one active staff member to attribute sales.</p>
        <Button asChild className="min-h-11 rounded-full">
          <Link href="/dashboard/staff">Open staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 md:-mx-2 md:max-w-none lg:-mx-4">
      <PosTabletClient
        registers={registers}
        staff={staff}
        products={products}
        openShiftsByRegisterId={boot.openShiftsByRegisterId}
        recentCustomers={recentCustomers}
        customerAttachEnabled={crm.allowed}
        quickOrderEnabled={quickOrderEnabled}
        businessType={kitchen?.businessType ?? "RESTAURANT"}
        canApplyPosDiscount={hasPermission(actor.granted, "pos.discount.apply")}
        offlineQueueEnabled={posSettings.offlineQueueEnabled}
        conflictResolution={posSettings.conflictResolution}
      />
    </div>
  );
}
