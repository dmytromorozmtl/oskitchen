import { mergePosSettings } from "@/lib/pos/pos-settings";
import type { HandheldOrderingBootstrap } from "@/lib/pos/handheld-ordering";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { getOpenTabs } from "@/services/pos/tab-service";
import { loadPosTerminalBootstrap } from "@/services/pos/pos-session-service";
import { getTablesForWorkspace } from "@/services/restaurant/table-service";

export async function loadHandheldOrderingBootstrap(userId: string): Promise<HandheldOrderingBootstrap> {
  const [boot, tables, tabs, kitchen] = await Promise.all([
    loadPosTerminalBootstrap(userId),
    getTablesForWorkspace(userId),
    getOpenTabs(userId),
    findOwnerKitchenSettings(userId, { posSettingsJson: true }),
  ]);
  const posSettings = mergePosSettings(kitchen?.posSettingsJson);

  return {
    registers: boot.registers.map((register) => ({
      id: register.id,
      name: register.name,
      locationId: register.locationId,
    })),
    staff: boot.staff.map((member) => ({ id: member.id, name: member.name })),
    products: boot.products.map((product) => ({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      category: product.category,
    })),
    tables: tables.map((table) => ({
      id: table.id,
      name: table.name,
      section: table.section,
      capacity: table.capacity,
      status: table.status,
    })),
    tabs: tabs.map((tab) => ({
      id: tab.id,
      name: tab.name,
      tableId: tab.tableId ?? null,
      items: tab.items,
    })),
    openShiftsByRegisterId: boot.openShiftsByRegisterId,
    offlineQueueEnabled: posSettings.offlineQueueEnabled,
    conflictResolution: posSettings.conflictResolution,
  };
}
