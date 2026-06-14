import type { Metadata } from "next";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { CafeModeTerminal } from "@/components/pos/cafe-mode-terminal";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { CAFE_MODE_P3_143_ROUTE } from "@/lib/pos/cafe-mode-p3-143-policy";
import { resolveCafeMode } from "@/lib/pos/cafe-mode-p3-143";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { loadPosTerminalBootstrap } from "@/services/pos/pos-session-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata: Metadata = {
  title: "Café mode POS",
  description:
    "Counter-first café POS at /dashboard/pos/cafe — 5 screens max for drinks, modifiers, payment, and receipt.",
};

/** PAGE_LAYOUT_EXCEPTION — full-screen café POS chrome. */

type CafePosPageProps = {
  searchParams?: Promise<{ cafe?: string }>;
};

export default function CafePosPage(props: CafePosPageProps) {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <CafePosPageAsync {...props} />
    </SuspenseWave1PageBoundary>
  );
}

async function CafePosPageAsync({
  searchParams,
}: CafePosPageProps) {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_cafe" />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const { userId } = actor;

  const [boot, operatingMode, kitchen] = await Promise.all([
    loadPosTerminalBootstrap(userId),
    getTenantOperatingMode(userId),
    findOwnerKitchenSettings(userId, { businessType: true }),
  ]);

  const cafeModeActive = resolveCafeMode({
    cafeParam: resolvedSearchParams.cafe,
    businessType: kitchen?.businessType ?? null,
  });
  const quickOrderEnabled = isDailyServiceMode(operatingMode);

  const products = boot.products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    category: p.category,
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

  if (!registers.length) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Café mode</h1>
        <p className="text-muted-foreground">Create a register before selling on the café counter.</p>
        <Button asChild className="min-h-11 rounded-full">
          <Link href="/dashboard/pos/registers">Add register</Link>
        </Button>
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="mx-auto max-w-lg space-y-4 pb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Café mode</h1>
        <p className="text-muted-foreground">Add at least one active staff member to attribute sales.</p>
        <Button asChild className="min-h-11 rounded-full">
          <Link href="/dashboard/staff">Open staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 md:-mx-2 md:max-w-none lg:-mx-4">
      <CafeModeTerminal
        registers={registers}
        staff={staff}
        products={products}
        openShiftsByRegisterId={boot.openShiftsByRegisterId}
        businessType={kitchen?.businessType ?? "CAFE"}
        quickOrderEnabled={quickOrderEnabled}
        cafeModeActive={cafeModeActive}
      />
      <p className="sr-only">Route: {CAFE_MODE_P3_143_ROUTE}</p>
    </div>
  );
}
