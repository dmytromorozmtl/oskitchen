import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PosTerminalClient } from "@/components/dashboard/pos-terminal-client";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { listCustomersForUser } from "@/services/crm/customer-service";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { loadPosTerminalBootstrap } from "@/services/pos/pos-session-service";

export default async function PosTerminalPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_terminal" />;
  }
  const [boot, operatingMode, kitchen] = await Promise.all([
    loadPosTerminalBootstrap(userId),
    getTenantOperatingMode(userId),
    findOwnerKitchenSettings(userId, { businessType: true }),
  ]);
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
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">POS Terminal</h1>
        <p className="text-muted-foreground">Create a register to start selling from the POS surface.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/pos/registers">Add register</Link>
        </Button>
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">POS Terminal</h1>
        <p className="text-muted-foreground">Add at least one active staff member to attribute sales.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/staff">Open staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS Terminal</h1>
          <p className="text-sm text-muted-foreground">Touch-first layout · catalog respects POS visibility on each menu item.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full" size="sm">
          <Link href="/dashboard/pos">Exit to POS hub</Link>
        </Button>
      </div>
      <PosTerminalClient
        registers={registers}
        staff={staff}
        products={products}
        openShiftsByRegisterId={boot.openShiftsByRegisterId}
        recentCustomers={recentCustomers}
        customerAttachEnabled={crm.allowed}
        quickOrderEnabled={quickOrderEnabled}
        businessType={kitchen?.businessType ?? "RESTAURANT"}
        canApplyPosDiscount={hasPermission(actor.granted, "pos.discount.apply")}
      />
    </div>
  );
}
