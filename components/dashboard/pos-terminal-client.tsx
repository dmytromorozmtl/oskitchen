"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Tag, Wifi, WifiOff } from "lucide-react";

import { posCheckoutAction } from "@/actions/pos";
import {
  logPosOfflineSaleQueuedAction,
  logPosOfflineSyncConflictAction,
} from "@/actions/pos-offline-audit";
import {
  enqueueOfflineCardCaptureAction,
  linkOfflineCardCaptureAction,
  syncOfflineCardCapturesAction,
} from "@/actions/pos-offline-card";
import { canQueueOfflineCardCapture } from "@/lib/pos/offline-pci-local-encryption";
import {
  enqueueOfflineCardClientCapture,
  listOfflineCardClientCaptures,
  removeOfflineCardClientCapture,
} from "@/lib/pos/offline-card-client-queue";
import { QuickOrderButtons, type QuickOrderItem } from "@/components/pos/quick-order-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  posTouchCompactClass,
  posTouchTileClass,
} from "@/lib/pos/touch-targets";
import {
  POS_TERMINAL_DENSITY_PRODUCT_GRID_CLASS,
  POS_TERMINAL_DENSITY_PRODUCT_PRICE_CLASS,
  POS_TERMINAL_DENSITY_PRODUCT_TILE_SURFACE_CLASS,
  POS_TERMINAL_DENSITY_PRODUCT_TITLE_CLASS,
} from "@/lib/design/pos-terminal-density-policy";
import {
  posCheckoutStatusClassName,
  type PosCheckoutStatus,
  type PosCheckoutStatusKind,
  toPosCheckoutStatus,
} from "@/lib/pos/pos-checkout-status";
import {
  StripeTerminalProvider,
} from "@/components/pos/stripe-terminal-reader";
import { posQuickCreateKitchenCustomerAction, posSearchKitchenCustomersAction } from "@/actions/pos-terminal-customers";
import { POS_OFFLINE_LIMITATIONS } from "@/lib/pos/pos-offline";
import {
  clearPosLocalCart,
  loadPosLocalCart,
  savePosLocalCart,
} from "@/lib/pos/pos-local-cart";
import {
  loadPosOfflineMenuCache,
  savePosOfflineMenuCache,
} from "@/lib/pos/pos-offline-menu-cache";

/** ReceiptPanel checkout status live region — data-testid="pos-checkout-status". */
import {
  enqueueOfflinePosCheckout,
  listOfflinePosCheckouts,
  registerOfflinePosBackgroundSync,
  removeOfflinePosCheckout,
  updateOfflinePosCheckout,
} from "@/lib/pos/offline-pos-queue";
import type { PosConflictResolutionStrategy } from "@/lib/pos/pos-settings";
import {
  broadcastOfflineSyncState,
} from "@/hooks/use-offline-sync-status";
import {
  classifyOfflineCheckoutError,
  formatOfflineSyncSuccessMessage,
  resolveOfflineSyncConflict,
} from "@/lib/pos/offline-sync";
import { OfflineSyncStatusBar } from "@/components/dashboard/offline-sync-status-bar";
import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { PAYMENT_MODE_LABEL } from "@/lib/orders/order-payment";
import { posPaymentAllowedWhileOffline } from "@/services/pos/pos-payment-service";
import {
  computePosTerminalAmountDue,
  computePosTerminalDiscountAmount,
  filterPosTerminalPaymentModes,
  parsePosTerminalFixedDiscountInput,
  parsePosTerminalPercentDiscountInput,
  type PosTerminalDiscountMode,
} from "@/lib/pos/pos-terminal-discount-ui";
import {
  buildPosProductCategories,
  filterPosProductsForCashierSpeed,
  posCashierSpeedModeLabel,
  posCashierSpeedModeToggleHref,
  posCashierSpeedProductGridClass,
  posCashierSpeedProductTileClass,
  shouldShowPosTerminalSecondaryPanels,
} from "@/lib/pos/pos-cashier-speed-mode-era19";
import { POS_CASHIER_SPEED_MODE_ALL_CATEGORY } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";
import {
  matchPosShortcut,
  quickAddIndexFromAction,
} from "@/lib/keyboard/shortcuts";
import {
  openPosCustomerDisplayWindow,
  publishPosCustomerDisplayState,
} from "@/lib/pos/pos-multi-monitor";
import { PosDesktopShortcutsOverlay } from "@/components/pos/pos-desktop-shortcuts-overlay";
import { PosDesktopToolbar } from "@/components/pos/pos-desktop-toolbar";
import { CartPanel } from "@/components/dashboard/pos-terminal/cart-panel";
import { ModifierPanel } from "@/components/dashboard/pos-terminal/modifier-panel";
import { PaymentPanel } from "@/components/dashboard/pos-terminal/payment-panel";
import { ReceiptPanel } from "@/components/dashboard/pos-terminal/receipt-panel";
import {
  type PosCustomerPick,
  type PosTerminalCartLine,
  type PosTerminalProduct,
  type PosTerminalRecentCustomer,
  type PosTerminalRegister,
  type PosTerminalStaff,
} from "@/components/dashboard/pos-terminal/pos-terminal-types";
import {
  shouldShowPosManagerOverrideHero,
  type PosManagerOverrideChecklistInput,
} from "@/lib/pos/pos-manager-override-clarity-era19";
import { POS_MANAGER_OVERRIDE_ANCHOR } from "@/lib/pos/pos-manager-override-clarity-era19-policy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  posTabletMainLayoutClass,
  posIpadNativeProductTileClass,
  type TabletOrientation,
} from "@/lib/pos/pos-tablet-layout";
import { triggerIpadNativePosHaptic } from "@/lib/pos/ipad-native-pos-haptics";
import { createPosTabletSwipeHandlers } from "@/lib/pos/ipad-native-pos-swipe";
import { cn } from "@/lib/utils";
import { fireCelebrationConfetti } from "@/components/ui/celebration-confetti";

export type {
  PosTerminalProduct,
  PosTerminalRegister,
  PosTerminalStaff,
  PosTerminalRecentCustomer,
} from "@/components/dashboard/pos-terminal/pos-terminal-types";

type CartLine = PosTerminalCartLine;

export function PosTerminalClient(props: {
  registers: PosTerminalRegister[];
  staff: PosTerminalStaff[];
  products: PosTerminalProduct[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  recentCustomers?: PosTerminalRecentCustomer[];
  /** When false, search / quick-add are hidden (plan without CRM). */
  customerAttachEnabled?: boolean;
  quickOrderEnabled?: boolean;
  businessType?: string | null;
  /** When true, operator may apply discounts and COMPED payment mode on terminal. */
  canApplyPosDiscount?: boolean;
  /** Rush-hour layout from ?speed=1 — denser grid and checkout-first panels. */
  initialSpeedMode?: boolean;
  /** Quick Start — confetti on first successful checkout. */
  showWelcome?: boolean;
  offlineQueueEnabled?: boolean;
  conflictResolution?: PosConflictResolutionStrategy;
  /** Desktop counter layout — keyboard shortcuts and multi-monitor customer display. */
  desktopMode?: boolean;
  /** iPad/Android tablet layout — orientation-aware catalog and cart. */
  tabletMode?: boolean;
  layoutOrientation?: TabletOrientation;
}) {
  const recentCustomers = props.recentCustomers ?? [];
  const customerAttachEnabled = props.customerAttachEnabled ?? true;
  const canApplyPosDiscount = props.canApplyPosDiscount ?? false;
  const speedMode = props.initialSpeedMode ?? false;
  const showWelcome = props.showWelcome ?? false;
  const welcomeConfettiFired = useRef(false);
  const offlineQueueEnabled = props.offlineQueueEnabled ?? true;
  const conflictResolution = props.conflictResolution ?? "manual_review";
  const desktopMode = props.desktopMode ?? true;
  const tabletMode = props.tabletMode ?? false;
  const layoutOrientation = props.layoutOrientation ?? "landscape";
  const showSecondaryPanels = shouldShowPosTerminalSecondaryPanels(speedMode);
  const [offlineMenuProducts, setOfflineMenuProducts] = useState<PosTerminalProduct[] | null>(null);
  const products = offlineMenuProducts ?? props.products;
  const categories = useMemo(
    () => buildPosProductCategories(products),
    [products],
  );
  const offlinePciEncryptionAvailable = canQueueOfflineCardCapture();
  const offlinePaymentGate = { offlinePciEncryptionAvailable };
  const availablePaymentModes = useMemo(
    () => filterPosTerminalPaymentModes(canApplyPosDiscount, offlinePciEncryptionAvailable),
    [canApplyPosDiscount, offlinePciEncryptionAvailable],
  );
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [registerId, setRegisterId] = useState(props.registers[0]?.id ?? "");
  const [staffId, setStaffId] = useState(props.staff[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentModeKey>("CASH");
  const [offlineCardLast4, setOfflineCardLast4] = useState("");
  const [offlineCardBrand, setOfflineCardBrand] = useState("visa");
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "DINE_IN" | "DELIVERY">("PICKUP");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<PosCheckoutStatus | null>(null);
  const [pendingTerminal, setPendingTerminal] = useState<{ orderId: string; amount: number } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [quickCustomerPending, startQuickCustomer] = useTransition();

  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomerPick | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [searchHits, setSearchHits] = useState<PosCustomerPick[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);
  const [quickCustomerError, setQuickCustomerError] = useState<string | null>(null);
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const searchSeq = useRef(0);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  const customerDisplayWindowRef = useRef<Window | null>(null);
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);
  const [customerDisplayActive, setCustomerDisplayActive] = useState(false);
  const [customerProfileNotice, setCustomerProfileNotice] = useState<string | null>(null);
  const [loyaltyPointsRedeem, setLoyaltyPointsRedeem] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null);
  const [queuedSales, setQueuedSales] = useState(0);
  const [conflictSales, setConflictSales] = useState(0);
  const [discountMode, setDiscountMode] = useState<PosTerminalDiscountMode>("none");
  const [fixedDiscountInput, setFixedDiscountInput] = useState("");
  const [percentDiscountInput, setPercentDiscountInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(POS_CASHIER_SPEED_MODE_ALL_CATEGORY);

  function showCheckoutStatus(text: string, kind?: PosCheckoutStatusKind) {
    setCheckoutStatus(toPosCheckoutStatus(text, kind));
    if (tabletMode) {
      if (kind === "success") triggerIpadNativePosHaptic("success");
      else if (kind === "error") triggerIpadNativePosHaptic("error");
    }
  }

  function resetDiscountState() {
    setDiscountMode("none");
    setFixedDiscountInput("");
    setPercentDiscountInput("");
  }

  function buildCheckoutPayload() {
    const openShiftId = registerId ? props.openShiftsByRegisterId[registerId]?.id ?? null : null;
    const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const discountAmount = computePosTerminalDiscountAmount({
      cartSubtotal: subtotal,
      discountMode,
      fixedAmount: parsePosTerminalFixedDiscountInput(fixedDiscountInput) ?? 0,
      percentValue: parsePosTerminalPercentDiscountInput(percentDiscountInput) ?? 0,
      paymentMode,
    });
    return {
      registerId,
      shiftId: openShiftId,
      staffMemberId: staffId || null,
      locationId: props.registers.find((r) => r.id === registerId)?.location?.id ?? null,
      brandId: null,
      customerId: selectedCustomer?.id ?? null,
      fulfillmentDetail: fulfillment,
      paymentMode,
      lines: cart.map((l) => ({
        productId: l.productId,
        title: l.productId ? undefined : l.title,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
      loyaltyPointsRedeem: loyaltyPointsRedeem
        ? Number.parseInt(loyaltyPointsRedeem, 10)
        : undefined,
      giftCardCode: giftCardCode.trim() || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    };
  }

  async function refreshOfflineCounts() {
    const rows = await listOfflinePosCheckouts();
    setQueuedSales(rows.length);
    setConflictSales(rows.filter((row) => row.syncStatus === "conflict").length);
  }

  async function flushOfflineQueue() {
    if (!offlineQueueEnabled) return;
    const queued = await listOfflinePosCheckouts();
    const pending = queued.filter((entry) => entry.syncStatus !== "conflict");
    if (!pending.length) {
      await refreshOfflineCounts();
      return;
    }

    broadcastOfflineSyncState("syncing");
    let synced = 0;
    let conflicts = 0;

    for (const entry of pending) {
      await updateOfflinePosCheckout(entry.id, { syncStatus: "syncing", syncError: undefined });
      const payload = {
        ...(entry.payload as Parameters<typeof posCheckoutAction>[0]),
        offlineSaleId: entry.id,
      };
      const res = await posCheckoutAction(payload);
      if (res.ok) {
        const cardCaptures = await listOfflineCardClientCaptures();
        const cardRow = cardCaptures.find((c) => c.offlineSaleId === entry.id);
        if (cardRow) {
          const fd = new FormData();
          fd.set("offlineSaleId", entry.id);
          fd.set("registerId", String(payload.registerId));
          fd.set("amountCents", String(cardRow.amountCents));
          fd.set("cardBrand", cardRow.cardBrand);
          fd.set("last4", cardRow.last4);
          if (cardRow.paymentIntentId) fd.set("paymentIntentId", cardRow.paymentIntentId);
          await enqueueOfflineCardCaptureAction(fd);
          const linkFd = new FormData();
          linkFd.set("offlineSaleId", entry.id);
          linkFd.set("orderId", res.orderId);
          await linkOfflineCardCaptureAction(linkFd);
          await removeOfflineCardClientCapture(cardRow.id);
        }
        await removeOfflinePosCheckout(entry.id);
        synced += 1;
        continue;
      }

      const reason = classifyOfflineCheckoutError(res.error);
      const resolution = resolveOfflineSyncConflict({
        strategy: conflictResolution,
        conflict: {
          offlineSaleId: entry.id,
          reason,
          message: res.error,
        },
      });

      if (resolution === "remove") {
        await removeOfflinePosCheckout(entry.id);
        synced += 1;
        continue;
      }

      conflicts += 1;
      await updateOfflinePosCheckout(entry.id, {
        syncStatus: "conflict",
        syncError: res.error,
        conflictReason: reason,
      });
      void logPosOfflineSyncConflictAction({
        offlineSaleId: entry.id,
        registerId: String(payload.registerId),
        reason,
        message: res.error,
      });
    }

    await refreshOfflineCounts();
    broadcastOfflineSyncState(conflicts > 0 ? "conflict" : "idle");

    if (synced > 0) {
      const cardSync = await syncOfflineCardCapturesAction();
      if (cardSync.ok && cardSync.data.captured > 0) {
        showCheckoutStatus(
          `${formatOfflineSyncSuccessMessage(synced)} · ${cardSync.data.captured} card capture(s) synced.`,
          "success",
        );
      } else if (conflicts === 0) {
        showCheckoutStatus(formatOfflineSyncSuccessMessage(synced), "success");
      }
    } else if (conflicts > 0) {
      showCheckoutStatus(
        `${conflicts} offline sale(s) need review — server data wins or inventory blocked sync.`,
        "error",
      );
    }
  }

  useEffect(() => {
    registerOfflinePosBackgroundSync();
    void refreshOfflineCounts();
    const on = () => {
      setOnline(true);
      void flushOfflineQueue();
    };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "OFFLINE_POS_SYNC") void flushOfflineQueue();
      });
    }
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [offlineQueueEnabled, conflictResolution]);

  useEffect(() => {
    if (!registerId) return;
    const snapshot = loadPosLocalCart(registerId);
    if (!snapshot?.cart.length) return;
    setCart((prev) => {
      if (prev.length > 0) return prev;
      return snapshot.cart.map((line, index) => ({
        key: line.productId
          ? `${line.productId}-restored-${index}`
          : `restored-${index}-${Date.now()}`,
        productId: line.productId,
        title: line.title,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        notes: line.notes ?? undefined,
      }));
    });
  }, [registerId]);

  useEffect(() => {
    if (!registerId) return;
    if (cart.length === 0) {
      clearPosLocalCart(registerId);
      return;
    }
    savePosLocalCart(
      registerId,
      cart.map((line) => ({
        productId: line.productId,
        title: line.title,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        notes: line.notes ?? undefined,
      })),
    );
  }, [registerId, cart]);

  useEffect(() => {
    const q = customerQuery.trim();
    if (q.length < 2) {
      searchSeq.current += 1;
      setSearchHits([]);
      setCustomerSearchError(null);
      setSearchingCustomer(false);
      return;
    }
    const my = ++searchSeq.current;
    const t = setTimeout(async () => {
      setSearchingCustomer(true);
      setCustomerSearchError(null);
      const res = await posSearchKitchenCustomersAction({ q });
      if (my !== searchSeq.current) return;
      setSearchingCustomer(false);
      if (res.ok) {
        setSearchHits(res.customers);
      } else {
        setSearchHits([]);
        setCustomerSearchError(res.error);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [customerQuery]);

  useEffect(() => {
    if (!selectedCustomer?.id) {
      setLoyaltyBalance(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/loyalty/balance?customerId=${selectedCustomer.id}`)
      .then((r) => r.json())
      .then((data: { balance?: number }) => {
        if (!cancelled) setLoyaltyBalance(data.balance ?? 0);
      })
      .catch(() => {
        if (!cancelled) setLoyaltyBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCustomer?.id]);

  useEffect(() => {
    const code = giftCardCode.trim();
    if (code.length < 4) {
      setGiftCardBalance(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      void fetch(`/api/gift-cards/balance?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data: { balance?: number; error?: string }) => {
          if (!cancelled) setGiftCardBalance(data.error ? null : (data.balance ?? null));
        })
        .catch(() => {
          if (!cancelled) setGiftCardBalance(null);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [giftCardCode]);

  useEffect(() => {
    if (!registerId || props.products.length === 0) return;
    void savePosOfflineMenuCache(registerId, props.products);
    setOfflineMenuProducts(null);
  }, [registerId, props.products]);

  useEffect(() => {
    if (!registerId || online || props.products.length > 0) return;
    let cancelled = false;
    void loadPosOfflineMenuCache(registerId).then((cache) => {
      if (!cancelled && cache?.products.length) {
        setOfflineMenuProducts(cache.products as PosTerminalProduct[]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [registerId, online, props.products.length]);

  const shiftId = registerId ? props.openShiftsByRegisterId[registerId]?.id ?? null : null;

  const filtered = useMemo(() => {
    if (speedMode) {
      return filterPosProductsForCashierSpeed({
        products,
        query,
        category: categoryFilter,
      });
    }
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase() === q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [products, query, speedMode, categoryFilter]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [cart],
  );

  const appliedDiscountAmount = useMemo(
    () =>
      computePosTerminalDiscountAmount({
        cartSubtotal: cartTotal,
        discountMode,
        fixedAmount: parsePosTerminalFixedDiscountInput(fixedDiscountInput) ?? 0,
        percentValue: parsePosTerminalPercentDiscountInput(percentDiscountInput) ?? 0,
        paymentMode,
      }),
    [cartTotal, discountMode, fixedDiscountInput, percentDiscountInput, paymentMode],
  );

  const amountDue = useMemo(
    () =>
      computePosTerminalAmountDue({
        cartSubtotal: cartTotal,
        discountAmount: appliedDiscountAmount,
        paymentMode,
      }),
    [cartTotal, appliedDiscountAmount, paymentMode],
  );

  const fixedDiscountInvalid =
    discountMode === "fixed" &&
    fixedDiscountInput.trim().length > 0 &&
    parsePosTerminalFixedDiscountInput(fixedDiscountInput) == null;

  const percentDiscountInvalid =
    discountMode === "percent" &&
    percentDiscountInput.trim().length > 0 &&
    parsePosTerminalPercentDiscountInput(percentDiscountInput) == null;

  const managerOverrideInput = useMemo<PosManagerOverrideChecklistInput>(
    () => ({
      canApplyPosDiscount,
      discountMode,
      paymentMode,
      cartSubtotal: cartTotal,
      cartItemCount: cart.length,
      fixedDiscountInvalid,
      percentDiscountInvalid,
      fixedDiscountInput,
      percentDiscountInput,
      appliedDiscountAmount,
      amountDue,
    }),
    [
      canApplyPosDiscount,
      discountMode,
      paymentMode,
      cartTotal,
      cart.length,
      fixedDiscountInvalid,
      percentDiscountInvalid,
      fixedDiscountInput,
      percentDiscountInput,
      appliedDiscountAmount,
      amountDue,
    ],
  );

  const showManagerOverrideHero = shouldShowPosManagerOverrideHero(managerOverrideInput);

  useEffect(() => {
    if (!availablePaymentModes.includes(paymentMode)) {
      setPaymentMode("CASH");
    }
  }, [availablePaymentModes, paymentMode]);

  function addQuickItem(item: QuickOrderItem) {
    setCart((prev) => [
      ...prev,
      {
        key: `quick-${item.id}-${Date.now()}`,
        title: item.name,
        quantity: 1,
        unitPrice: item.price,
      },
    ]);
  }

  function addProduct(p: Pick<PosTerminalProduct, "id" | "title" | "price">) {
    if (tabletMode) triggerIpadNativePosHaptic("tap");
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          key: `${p.id}-${Date.now()}`,
          productId: p.id,
          title: p.title,
          quantity: 1,
          unitPrice: p.price,
        },
      ];
    });
  }

  function bump(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function scrollToDiscountPanel() {
    if (!canApplyPosDiscount) return;
    document.getElementById(POS_MANAGER_OVERRIDE_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setDiscountMode((mode) => (mode === "none" ? "fixed" : mode));
  }

  function toggleCustomerDisplayWindow() {
    const win = openPosCustomerDisplayWindow();
    if (win) {
      customerDisplayWindowRef.current = win;
      setCustomerDisplayActive(true);
      return;
    }
    if (customerDisplayWindowRef.current && !customerDisplayWindowRef.current.closed) {
      customerDisplayWindowRef.current.close();
    }
    customerDisplayWindowRef.current = null;
    setCustomerDisplayActive(false);
  }

  const activeRegisterName =
    props.registers.find((register) => register.id === registerId)?.name ?? "Register";

  function checkout() {
    setCheckoutStatus(null);
    if (!registerId) {
      showCheckoutStatus("Create a register before checking out.", "error");
      return;
    }
    if (!cart.length) {
      showCheckoutStatus("Add at least one item.", "error");
      return;
    }
    if (fixedDiscountInvalid || percentDiscountInvalid) {
      showCheckoutStatus("Enter a valid discount amount before completing the sale.", "error");
      return;
    }
    if (!online && offlineQueueEnabled && posPaymentAllowedWhileOffline(paymentMode, offlinePaymentGate)) {
      if (paymentMode === "OFFLINE_CARD_QUEUED") {
        const last4 = offlineCardLast4.replace(/\D/g, "").slice(-4);
        if (last4.length !== 4) {
          showCheckoutStatus("Enter the last 4 digits shown on the guest card (never the full number).", "error");
          return;
        }
      }
      startTransition(async () => {
        const payload = buildCheckoutPayload();
        const offlineSaleId = await enqueueOfflinePosCheckout(payload);
        const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
        void logPosOfflineSaleQueuedAction({
          offlineSaleId,
          registerId,
          paymentMode,
          lineCount: cart.length,
          total: subtotal,
        });
        if (paymentMode === "OFFLINE_CARD_QUEUED" && registerId) {
          const last4 = offlineCardLast4.replace(/\D/g, "").slice(-4);
          await enqueueOfflineCardClientCapture({
            offlineSaleId,
            registerId,
            amountCents: Math.round(amountDue * 100),
            cardBrand: offlineCardBrand,
            last4,
          });
        }
        await refreshOfflineCounts();
        setCart([]);
        clearPosLocalCart(registerId);
        resetDiscountState();
        setOfflineCardLast4("");
        showCheckoutStatus(
          paymentMode === "OFFLINE_CARD_QUEUED"
            ? "Offline — card sale queued (last4 only). Capture syncs when online."
            : "Offline — sale queued. Will sync when back online.",
          "info",
        );
        broadcastOfflineSyncState("idle");
      });
      return;
    }
    if (!online && !offlineQueueEnabled) {
      showCheckoutStatus("Offline queue is disabled — reconnect before completing sales.", "error");
      return;
    }
    if (!online && !posPaymentAllowedWhileOffline(paymentMode, offlinePaymentGate)) {
      showCheckoutStatus(
        paymentMode === "OFFLINE_CARD_QUEUED" && !offlinePciEncryptionAvailable
          ? "Offline card requires Web Crypto on this device — use cash or reconnect."
          : "Reconnect before using card or Stripe placeholder modes.",
        "error",
      );
      return;
    }
    startTransition(async () => {
      const res = await posCheckoutAction(buildCheckoutPayload());
      if (!res.ok) {
        showCheckoutStatus(res.error, "error");
        return;
      }
      if (paymentMode === "CARD_TERMINAL_PLACEHOLDER") {
        setPendingTerminal({ orderId: res.orderId, amount: amountDue });
        setCart([]);
        resetDiscountState();
        showCheckoutStatus(
          `Order ${res.orderId.slice(0, 8)}… ready — tap card to complete payment.`,
          "success",
        );
        return;
      }
      setCart([]);
      resetDiscountState();
      clearPosLocalCart(registerId);
      showCheckoutStatus(
        `Sale complete — order ${res.orderId.slice(0, 8)}… receipt ${res.receiptNumber}`,
        "success",
      );
      if (showWelcome && !welcomeConfettiFired.current) {
        welcomeConfettiFired.current = true;
        fireCelebrationConfetti();
      }
    });
  }

  useEffect(() => {
    if (!desktopMode) return;
    function onKeyDown(e: KeyboardEvent) {
      const action = matchPosShortcut(e);
      if (!action) return;
      e.preventDefault();
      if (action === "focus_product_search") {
        productSearchRef.current?.focus();
        return;
      }
      if (action === "focus_customer_search") {
        customerSearchRef.current?.focus();
        return;
      }
      if (action === "add_first_product") {
        const first = filtered[0];
        if (first) addProduct(first);
        return;
      }
      const quickIndex = quickAddIndexFromAction(action);
      if (quickIndex != null) {
        const product = filtered[quickIndex - 1];
        if (product) addProduct(product);
        return;
      }
      if (action === "payment_cash") {
        setPaymentMode("CASH");
        return;
      }
      if (action === "payment_card") {
        if (availablePaymentModes.includes("CARD_TERMINAL_PLACEHOLDER")) {
          setPaymentMode("CARD_TERMINAL_PLACEHOLDER");
        }
        return;
      }
      if (action === "toggle_discount_panel") {
        scrollToDiscountPanel();
        return;
      }
      if (action === "toggle_customer_display") {
        toggleCustomerDisplayWindow();
        return;
      }
      if (action === "show_shortcuts_help") {
        setShowShortcutsOverlay(true);
        return;
      }
      if (action === "increment_last_line" && cart.length > 0) {
        bump(cart[cart.length - 1]!.key, 1);
        return;
      }
      if (action === "decrement_last_line" && cart.length > 0) {
        bump(cart[cart.length - 1]!.key, -1);
        return;
      }
      if (action === "complete_sale") {
        checkout();
        return;
      }
      if (action === "cancel") {
        setCart([]);
        resetDiscountState();
        setCheckoutStatus(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered, desktopMode, cart, availablePaymentModes, canApplyPosDiscount]);

  useEffect(() => {
    if (!desktopMode || !customerDisplayActive) return;
    publishPosCustomerDisplayState({
      registerName: activeRegisterName,
      lines: cart.map((line) => ({
        title: line.title,
        quantity: line.quantity,
        lineTotal: line.quantity * line.unitPrice,
      })),
      subtotal: cartTotal,
      discount: appliedDiscountAmount,
      total: amountDue,
      paymentLabel: PAYMENT_MODE_LABEL[paymentMode] ?? paymentMode,
      updatedAtIso: new Date().toISOString(),
    });
  }, [
    desktopMode,
    customerDisplayActive,
    activeRegisterName,
    cart,
    cartTotal,
    appliedDiscountAmount,
    amountDue,
    paymentMode,
  ]);

  useEffect(() => {
    if (!desktopMode) return;
    const timer = window.setInterval(() => {
      const win = customerDisplayWindowRef.current;
      if (win && win.closed) {
        customerDisplayWindowRef.current = null;
        setCustomerDisplayActive(false);
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [desktopMode]);

  const stripeTerminalActive =
    paymentMode === "CARD_TERMINAL_PLACEHOLDER" || pendingTerminal != null;

  return (
    <StripeTerminalProvider active={stripeTerminalActive}>
      {/* Card terminal tap-to-pay: ReceiptPanel forwards onError via onTerminalError */}
    <div className="space-y-4">
      {desktopMode ? (
        <PosDesktopToolbar
          customerDisplayActive={customerDisplayActive}
          onToggleCustomerDisplay={toggleCustomerDisplayWindow}
          onShowShortcuts={() => setShowShortcutsOverlay(true)}
        />
      ) : null}
      {desktopMode ? (
        <PosDesktopShortcutsOverlay
          open={showShortcutsOverlay}
          onClose={() => setShowShortcutsOverlay(false)}
        />
      ) : null}
    <div
      data-pos-layout
      className={cn(
        "flex min-h-[calc(100vh-8rem)]",
        posTabletMainLayoutClass(layoutOrientation, tabletMode),
      )}
    >
      <div className="flex min-w-0 flex-1 basis-0 flex-col gap-3 overflow-hidden">
        <OfflineSyncStatusBar className="w-full" showWhenIdle={offlineQueueEnabled} />
        <div
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-sm">
            {online ? (
              <Wifi className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-600" aria-hidden />
            )}
            <span className="text-muted-foreground">{online ? "Online" : "Offline / degraded"}</span>
            {offlineQueueEnabled ? (
              <span className="text-xs font-medium text-emerald-700">Offline queue on</span>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">Offline queue off</span>
            )}
            {queuedSales > 0 ? (
              <span className="text-xs font-medium text-amber-700">{queuedSales} queued sale(s)</span>
            ) : null}
            {conflictSales > 0 ? (
              <span className="text-xs font-medium text-rose-700">{conflictSales} conflict(s)</span>
            ) : null}
          </div>
          {!online ? (
            <span className="text-xs text-muted-foreground">
              Offline mode works for cash and saved payments. Card requires connection.{" "}
              {POS_OFFLINE_LIMITATIONS[0]}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Offline mode works for cash and saved payments. Card requires connection.
            </span>
          )}
        </div>
        {props.quickOrderEnabled ? (
          <QuickOrderButtons
            businessType={props.businessType ?? "RESTAURANT"}
            onItemClick={addQuickItem}
          />
        ) : null}
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            ref={productSearchRef}
            data-testid="pos-product-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              speedMode ? "Search or scan barcode + Enter" : "Search menu or type barcode + Enter"
            }
            className="h-12 rounded-xl text-base"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const hit = products.find(
                (p) => p.barcode && p.barcode.toLowerCase() === query.trim().toLowerCase(),
              );
              if (hit) {
                addProduct(hit);
                setQuery("");
              }
            }}
          />
          <Button
            asChild
            variant={speedMode ? "default" : "outline"}
            className="h-12 rounded-xl"
          >
            <Link
              href={posCashierSpeedModeToggleHref(speedMode)}
              data-testid="pos-cashier-speed-mode-toggle"
            >
              {posCashierSpeedModeLabel(speedMode)}
            </Link>
          </Button>
          {!speedMode ? (
            <Button variant="outline" className="h-12 rounded-xl" asChild>
              <Link href="/dashboard/pos/settings/hardware">Hardware</Link>
            </Button>
          ) : null}
        </div>
        {speedMode ? (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            data-testid="pos-speed-category-strip"
            role="tablist"
            aria-label="Product categories"
          >
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                role="tab"
                aria-selected={categoryFilter === category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                className={cn("shrink-0 rounded-full", posTouchCompactClass)}
                data-testid={`pos-speed-category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        ) : null}
        <div
          className={cn(
            POS_TERMINAL_DENSITY_PRODUCT_GRID_CLASS,
            posCashierSpeedProductGridClass(speedMode),
          )}
          data-testid={speedMode ? "pos-speed-product-grid" : "pos-product-grid"}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={Tag}
              variant="inline"
              title={products.length === 0 ? "No menu items for POS" : "No matching items"}
              description={
                products.length === 0
                  ? "Add products to your active menu before ringing sales on this register."
                  : "Try another search term or category filter."
              }
              primaryLabel={products.length === 0 ? "Manage products" : undefined}
              primaryHref={products.length === 0 ? "/dashboard/products" : undefined}
              showDemoLink={false}
              className="col-span-full"
            />
          ) : (
          filtered.map((p) => {
            const tabletSwipe = tabletMode
              ? createPosTabletSwipeHandlers({
                  onSwipeRight: () => addProduct(p),
                  onTap: () => addProduct(p),
                })
              : null;
            const { touchAction, ...swipeHandlers } = tabletSwipe ?? {
              touchAction: undefined,
              onPointerDown: undefined,
              onPointerUp: undefined,
              onPointerCancel: undefined,
            };

            return (
            <button
              type="button"
              key={p.id}
              data-testid="pos-product-tile"
              data-ipad-native-polish={tabletMode ? "true" : undefined}
              {...(tabletMode
                ? {
                    style: { touchAction },
                    ...swipeHandlers,
                  }
                : { onClick: () => addProduct(p) })}
              className={cn(
                POS_TERMINAL_DENSITY_PRODUCT_TILE_SURFACE_CLASS,
                posTouchTileClass,
                "flex-col",
                posCashierSpeedProductTileClass(speedMode),
                tabletMode && posIpadNativeProductTileClass(),
              )}
            >
              {!speedMode ? (
                <span className="text-xs uppercase text-muted-foreground">{p.category}</span>
              ) : null}
              <span
                className={cn(
                  POS_TERMINAL_DENSITY_PRODUCT_TITLE_CLASS,
                  speedMode ? "text-sm" : "mt-2 text-base",
                )}
              >
                {p.title}
              </span>
              <span
                className={cn(
                  POS_TERMINAL_DENSITY_PRODUCT_PRICE_CLASS,
                  speedMode ? "text-base" : "pt-3 text-lg",
                )}
              >
                ${p.price.toFixed(2)}
              </span>
            </button>
            );
          })
          )}
        </div>
      </div>

      <CartPanel
        speedMode={speedMode}
        tabletMode={tabletMode}
        layoutOrientation={layoutOrientation}
        registers={props.registers}
        staff={props.staff}
        registerId={registerId}
        staffId={staffId}
        shiftId={shiftId}
        fulfillment={fulfillment}
        cart={cart}
        pending={pending}
        customerAttachEnabled={customerAttachEnabled}
        showSecondaryPanels={showSecondaryPanels}
        recentCustomers={recentCustomers}
        selectedCustomer={selectedCustomer}
        customerQuery={customerQuery}
        searchHits={searchHits}
        searchingCustomer={searchingCustomer}
        customerSearchError={customerSearchError}
        customerProfileNotice={customerProfileNotice}
        showQuickCustomer={showQuickCustomer}
        quickName={quickName}
        quickEmail={quickEmail}
        quickPhone={quickPhone}
        quickCustomerError={quickCustomerError}
        quickCustomerPending={quickCustomerPending}
        customerSearchRef={customerSearchRef}
        onRegisterChange={setRegisterId}
        onStaffChange={setStaffId}
        onFulfillmentChange={setFulfillment}
        onBumpLine={bump}
        onRemoveLine={removeLine}
        onCustomerQueryChange={setCustomerQuery}
        onSelectCustomer={(c) => {
          setSelectedCustomer(c);
          setCustomerQuery("");
          setSearchHits([]);
          setQuickCustomerError(null);
          setCustomerProfileNotice(null);
        }}
        onClearCustomer={() => {
          setSelectedCustomer(null);
          setCustomerQuery("");
          setSearchHits([]);
          setCustomerProfileNotice(null);
        }}
        onToggleQuickCustomer={() => {
          setShowQuickCustomer((v) => !v);
          setQuickCustomerError(null);
        }}
        onQuickNameChange={setQuickName}
        onQuickEmailChange={setQuickEmail}
        onQuickPhoneChange={setQuickPhone}
        onQuickCreateCustomer={() => {
          setQuickCustomerError(null);
          startQuickCustomer(async () => {
            const res = await posQuickCreateKitchenCustomerAction({
              name: quickName.trim(),
              email: quickEmail.trim(),
              phone: quickPhone.trim(),
            });
            if (!res.ok) {
              setQuickCustomerError(res.error);
              return;
            }
            setSelectedCustomer({
              id: res.customer.id,
              email: res.customer.email,
              label: res.customer.label,
              phone: res.customer.phone,
            });
            setCustomerProfileNotice(
              res.mergedFromExisting
                ? "This email already had a CRM profile — we linked that record. Empty fields were filled only where your rules allow."
                : "New CRM profile created and linked to this sale.",
            );
            setQuickName("");
            setQuickEmail("");
            setQuickPhone("");
            setShowQuickCustomer(false);
          });
        }}
        paymentPanel={
          <PaymentPanel
            availablePaymentModes={availablePaymentModes}
            paymentMode={paymentMode}
            canApplyPosDiscount={canApplyPosDiscount}
            showSecondaryPanels={showSecondaryPanels}
            offlineCardLast4={offlineCardLast4}
            offlineCardBrand={offlineCardBrand}
            selectedCustomer={selectedCustomer}
            loyaltyPointsRedeem={loyaltyPointsRedeem}
            giftCardCode={giftCardCode}
            loyaltyBalance={loyaltyBalance}
            giftCardBalance={giftCardBalance}
            onPaymentModeChange={setPaymentMode}
            onOfflineCardLast4Change={setOfflineCardLast4}
            onOfflineCardBrandChange={setOfflineCardBrand}
            onLoyaltyPointsRedeemChange={setLoyaltyPointsRedeem}
            onGiftCardCodeChange={setGiftCardCode}
          />
        }
        modifierPanel={
          <ModifierPanel
            showSecondaryPanels={showSecondaryPanels}
            canApplyPosDiscount={canApplyPosDiscount}
            managerOverrideInput={managerOverrideInput}
            showManagerOverrideHero={showManagerOverrideHero}
            discountMode={discountMode}
            paymentMode={paymentMode}
            fixedDiscountInput={fixedDiscountInput}
            percentDiscountInput={percentDiscountInput}
            fixedDiscountInvalid={fixedDiscountInvalid}
            percentDiscountInvalid={percentDiscountInvalid}
            onResetDiscount={resetDiscountState}
            onDiscountModeChange={setDiscountMode}
            onFixedDiscountInputChange={setFixedDiscountInput}
            onPercentDiscountInputChange={setPercentDiscountInput}
            onCompSale={() => {
              setPaymentMode("COMPED");
              resetDiscountState();
            }}
            onClearCompIfNeeded={() => {
              if (paymentMode === "COMPED") setPaymentMode("CASH");
            }}
          />
        }
        receiptPanel={
          <ReceiptPanel
            cartTotal={cartTotal}
            appliedDiscountAmount={appliedDiscountAmount}
            amountDue={amountDue}
            speedMode={speedMode}
            pending={pending}
            checkoutStatus={checkoutStatus}
            pendingTerminal={pendingTerminal}
            onCheckout={checkout}
            onTerminalSuccess={() => {
              const orderRef = pendingTerminal!.orderId.slice(0, 8);
              setPendingTerminal(null);
              showCheckoutStatus(`Card payment captured — order ${orderRef}…`, "success");
            }}
            onTerminalError={(error) => showCheckoutStatus(error, "error")}
          />
        }
      />    </div>
    </div>
    </StripeTerminalProvider>
  );
}
