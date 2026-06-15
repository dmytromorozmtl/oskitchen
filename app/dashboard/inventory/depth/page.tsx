import type { Metadata } from "next";

import { InventoryReservationsDepthPanel } from "@/components/inventory/inventory-reservations-depth-panel";
import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-policy";

export const metadata: Metadata = {
  title: "Inventory + reservations depth",
  description:
    "Lightspeed parity baseline at /dashboard/inventory/depth — nine shipped inventory and reservation modules.",
};

export default function InventoryReservationsDepthPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <InventoryReservationsDepthPanel />
      <p className="sr-only">
        Policy {INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID} · {INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE} ·{" "}
        {INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE}
      </p>
    </div>
  );
}
