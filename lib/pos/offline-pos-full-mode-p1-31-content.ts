import { OFFLINE_POS_FULL_MODE_P1_31_ROUTE } from "@/lib/pos/offline-pos-full-mode-p1-31-policy";
import { POS_OFFLINE_LIMITATIONS } from "@/lib/pos/pos-offline";

export const OFFLINE_POS_FULL_MODE_P1_31_EYEBROW = "Offline POS full mode" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_HEADLINE =
  "Toast-parity offline register — menu cache, queue, sync, PCI-safe card metadata" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_SUBLINE =
  "Full mode extends v1 with IndexedDB menu cache for refresh-while-offline, AES-GCM-only card sealing, and formal noop-v1 empty-field review. EMV store-and-forward remains out of scope." as const;

export const OFFLINE_POS_FULL_MODE_P1_31_CAPABILITIES = [
  {
    id: "pos-offline-menu-cache",
    label: "Menu cache",
    description:
      "POS-visible products persist in IndexedDB when online — terminal reloads cached menu while offline.",
    module: "lib/pos/pos-offline-menu-cache.ts",
  },
  {
    id: "pos-offline-local-cart",
    label: "Local cart",
    description:
      "Active register cart persists in sessionStorage so refresh mid-service does not wipe line items.",
    module: "lib/pos/pos-local-cart.ts",
  },
  {
    id: "pos-offline-cash-queue",
    label: "Cash & mark-paid offline",
    description:
      "Cash and external-terminal mark-paid sales enqueue in checkout_queue and replay on reconnect.",
    module: "lib/pos/offline-pos-queue.ts",
  },
  {
    id: "pos-offline-pci-aes-gcm",
    label: "PCI AES-GCM sealing",
    description:
      "last4, brand, and pi_* references sealed with aes-gcm-v1 — OFFLINE_CARD_QUEUED blocked without Web Crypto.",
    module: "lib/pos/offline-pci-local-encryption.ts",
  },
  {
    id: "pos-offline-sync-queue",
    label: "Auto-sync queue",
    description:
      "checkout_queue and card_capture_queue replay via posCheckoutAction on online event and 60s interval.",
    module: "lib/pos/offline-pos-auto-sync.ts",
  },
  {
    id: "pos-offline-conflict-resolution",
    label: "Conflict resolution",
    description:
      "Duplicate, inventory, shift closed, and plan blocked conflicts classify for manual_review or server_wins.",
    module: "lib/pos/offline-sync.ts",
  },
  {
    id: "pos-offline-noop-v1-review",
    label: "noop-v1 fallback review",
    description:
      "noop-v1 reserved for empty fields only — no plaintext btoa fallback; legacy unseal for migration reads.",
    module: "lib/pos/offline-pci-noop-v1-review.ts",
  },
] as const;

export const OFFLINE_POS_FULL_MODE_P1_31_TOAST_PARITY = [
  "Ring sales while offline (cash + queued card metadata)",
  "Menu available after reconnect or from local cache",
  "Automatic sync when connectivity returns",
  "Honest limitation: no certified EMV store-and-forward",
] as const;

export const OFFLINE_POS_FULL_MODE_P1_31_LIMITATIONS = POS_OFFLINE_LIMITATIONS;

export const OFFLINE_POS_FULL_MODE_P1_31_OPERATOR_LINKS = [
  { label: "POS terminal", href: "/dashboard/pos/terminal" },
  { label: "Offline settings", href: OFFLINE_POS_FULL_MODE_P1_31_ROUTE },
] as const;
