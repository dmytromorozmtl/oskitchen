import {
  POS_OFFLINE_MODE_V1_CAPABILITY_COUNT,
  POS_OFFLINE_MODE_V1_ROUTE,
} from "@/lib/pos/pos-offline-mode-v1-policy";
import { POS_OFFLINE_LIMITATIONS } from "@/lib/pos/pos-offline";

export const POS_OFFLINE_MODE_V1_EYEBROW = "POS offline mode v1.0" as const;

export const POS_OFFLINE_MODE_V1_HEADLINE =
  "Local cart, sync queue, and honest offline payment caveats" as const;

export const POS_OFFLINE_MODE_V1_SUBLINE =
  "Cash and offline-safe modes queue in IndexedDB and replay on reconnect. Card EMV store-and-forward is not certified — verify payment mode before rush service." as const;

export const POS_OFFLINE_MODE_V1_CAPABILITIES = [
  {
    id: "pos-offline-local-cart",
    label: "Local cart",
    description:
      "Active register cart persists in sessionStorage so a refresh mid-service does not wipe line items.",
    module: "lib/pos/pos-local-cart.ts",
  },
  {
    id: "pos-offline-payment-caveat",
    label: "Offline payment caveat",
    description: POS_OFFLINE_LIMITATIONS[2],
    module: "lib/pos/pos-offline.ts",
  },
  {
    id: "pos-offline-sync-queue",
    label: "Sync queue",
    description:
      "Completed offline sales enqueue in IndexedDB checkout_queue and replay via posCheckoutAction with idempotent offlineSaleId.",
    module: "lib/pos/offline-pos-queue.ts",
  },
  {
    id: "pos-offline-conflict-resolution",
    label: "Conflict resolution",
    description:
      "Sync failures classify as duplicate, inventory, shift closed, or plan blocked — manual_review default; server_wins optional.",
    module: "lib/pos/offline-sync.ts",
  },
  {
    id: "pos-offline-audit-log",
    label: "Audit log",
    description:
      "Queue, sync, and conflict events write to workspace audit log — replayed checkouts include offlineSaleId metadata.",
    module: "services/pos/pos-offline-audit-service.ts",
  },
] as const;

export const POS_OFFLINE_MODE_V1_OPERATOR_LINKS = [
  { label: "POS terminal", href: "/dashboard/pos/terminal" },
  { label: "POS settings", href: "/dashboard/pos/settings" },
  { label: "Offline mode doc", href: POS_OFFLINE_MODE_V1_ROUTE },
] as const;

export { POS_OFFLINE_MODE_V1_CAPABILITY_COUNT, POS_OFFLINE_MODE_V1_ROUTE };
