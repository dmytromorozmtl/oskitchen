import Link from "next/link";

import { PosTerminalManagerAuditFlowProofPanel } from "@/components/dashboard/pos/pos-terminal-manager-audit-flow-proof-panel";
import { OfflineCardSyncPanel } from "@/components/pos/offline-card-sync-panel";
import { PosTerminalClient } from "@/components/dashboard/pos-terminal-client";
import { PosWelcomeBanner } from "@/components/dashboard/pos-welcome-banner";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { listCustomersForUser } from "@/services/crm/customer-service";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { mergePosSettings } from "@/lib/pos/pos-settings";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { loadPosTerminalBootstrap } from "@/services/pos/pos-session-service";
import {
  posCashierSpeedModeHeadline,
} from "@/lib/pos/pos-cashier-speed-mode-era19";
import { POS_DESKTOP_TERMINAL_ROUTE } from "@/lib/pos/pos-desktop-shortcuts-policy";
import type { ManagerDiscountAuditFlowProofSlice } from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20";

type PosTerminalAsyncSectionProps = {
  actor: WorkspacePermissionActor;
  speedMode: boolean;
  showWelcome: boolean;
  managerAuditFlowProof: ManagerDiscountAuditFlowProofSlice;
};

export async function PosTerminalAsyncSection({
  actor,
  speedMode,
  showWelcome,
  managerAuditFlowProof,
}: PosTerminalAsyncSectionProps) {
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
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS Terminal</h1>
          <p className="text-sm text-muted-foreground">
            {speedMode
              ? posCashierSpeedModeHeadline(true)
              : "Desktop POS · F1–F9 shortcuts · F8 customer display on second monitor · catalog respects POS visibility."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!speedMode ? (
            <Button asChild variant="outline" className="rounded-full" size="sm">
              <Link href={`${POS_DESKTOP_TERMINAL_ROUTE}/customer-display`} target="_blank" rel="noopener">
                Open customer display
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full" size="sm">
            <Link href="/dashboard/pos">Exit to POS hub</Link>
          </Button>
        </div>
      </div>

      {showWelcome ? <PosWelcomeBanner /> : null}

      <PosTerminalManagerAuditFlowProofPanel slice={managerAuditFlowProof} />

      <OfflineCardSyncPanel />

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
        initialSpeedMode={speedMode}
        showWelcome={showWelcome}
        offlineQueueEnabled={posSettings.offlineQueueEnabled}
        conflictResolution={posSettings.conflictResolution}
        desktopMode={!speedMode}
      />
    </>
  );
}
