/**
 * Canonical task-slot → role-id map for the 220-task cyclic executor.
 *
 * @see lib/execution/execution-tracker-reconciliation-audit-policy.ts
 */

export const EXECUTION_TRACKER_SLOT_COUNT = 220 as const;

/** Capstone overlay slots (cycle track) — same role ids as canonical high slots. */
export const EXECUTION_TRACKER_CAPSTONE_OVERLAY_SLOTS: ReadonlyArray<{
  slot: number;
  roleId: string;
}> = [
  { slot: 172, roleId: "PM-01" },
  { slot: 173, roleId: "PM-02" },
  { slot: 174, roleId: "PM-03" },
  { slot: 175, roleId: "PM-04" },
  { slot: 176, roleId: "PM-05" },
  { slot: 177, roleId: "PM-06" },
  { slot: 178, roleId: "COMP-01" },
  { slot: 179, roleId: "COMP-02" },
  { slot: 180, roleId: "COMP-03" },
  { slot: 181, roleId: "EXEC-01" },
] as const;

export const EXECUTION_TRACKER_RECONCILIATION_SLOT_END = 193 as const;

export function taskSlotKey(slot: number): string {
  return `task-${slot}`;
}

/** Resolve audit role id for a 1-based task slot (null if out of range). */
export function resolveRoleIdForTaskSlot(slot: number): string | null {
  if (slot < 1 || slot > EXECUTION_TRACKER_SLOT_COUNT) return null;
  if (slot <= 10) return `DEV-${String(slot).padStart(2, "0")}`;
  if (slot <= 20) return `QA-${String(slot - 10).padStart(2, "0")}`;
  if (slot <= 28) return `DES-${String(slot - 20).padStart(2, "0")}`;
  if (slot <= 38) return `MKT-${String(slot - 28).padStart(2, "0")}`;
  if (slot <= 53) return `DEV-${String(slot - 28).padStart(2, "0")}`;
  if (slot <= 77) return `QA-${String(slot - 43).padStart(2, "0")}`;
  if (slot <= 95) return `DES-${String(slot - 69).padStart(2, "0")}`;
  if (slot <= 113) return `MKT-${String(slot - 85).padStart(2, "0")}`;
  if (slot <= 145) return `DEV-${String(slot - 90).padStart(2, "0")}`;
  if (slot <= 156) return `QA-${String(slot - 111).padStart(2, "0")}`;
  if (slot <= 168) return `DES-${String(slot - 130).padStart(2, "0")}`;
  if (slot <= 182) return `MKT-${String(slot - 140).padStart(2, "0")}`;
  if (slot <= 188) return `PM-${String(slot - 182).padStart(2, "0")}`;
  if (slot <= 191) return `COMP-${String(slot - 188).padStart(2, "0")}`;
  if (slot === 192) return "DEV-56";
  if (slot === 193) return "EXEC-01";
  if (slot === 194) return "EXEC-02";
  if (slot <= 220) return `FINAL-${String(slot - 194).padStart(2, "0")}`;
  return null;
}

export function listReconciliationTaskSlots(): number[] {
  return Array.from({ length: EXECUTION_TRACKER_RECONCILIATION_SLOT_END }, (_, i) => i + 1);
}
