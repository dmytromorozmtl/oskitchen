import type { RefObject } from "react";
import type { PaymentModeKey } from "@/lib/orders/order-payment";
import type { PosTerminalDiscountMode } from "@/lib/pos/pos-terminal-discount-ui";
import type { PosManagerOverrideChecklistInput } from "@/lib/pos/pos-manager-override-clarity-era19";
import type { PosCheckoutStatus } from "@/lib/pos/pos-checkout-status";
import type { TabletOrientation } from "@/lib/pos/pos-tablet-layout";

export type PosTerminalProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  barcode: string | null;
  image: string | null;
};

export type PosTerminalRegister = {
  id: string;
  name: string;
  location: { id: string; name: string } | null;
};

export type PosTerminalStaff = { id: string; name: string };

export type PosTerminalRecentCustomer = {
  id: string;
  email: string;
  label: string;
  phone: string | null;
};

export type PosCustomerPick = {
  id: string;
  email: string;
  label: string;
  phone: string | null;
};

export type PosTerminalCartLine = {
  key: string;
  productId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
};

export type PosTerminalCartPanelProps = {
  speedMode: boolean;
  tabletMode: boolean;
  layoutOrientation: TabletOrientation;
  registers: PosTerminalRegister[];
  staff: PosTerminalStaff[];
  registerId: string;
  staffId: string;
  shiftId: string | null;
  fulfillment: "PICKUP" | "DINE_IN" | "DELIVERY";
  cart: PosTerminalCartLine[];
  pending: boolean;
  customerAttachEnabled: boolean;
  showSecondaryPanels: boolean;
  recentCustomers: PosTerminalRecentCustomer[];
  selectedCustomer: PosCustomerPick | null;
  customerQuery: string;
  searchHits: PosCustomerPick[];
  searchingCustomer: boolean;
  customerSearchError: string | null;
  customerProfileNotice: string | null;
  showQuickCustomer: boolean;
  quickName: string;
  quickEmail: string;
  quickPhone: string;
  quickCustomerError: string | null;
  quickCustomerPending: boolean;
  customerSearchRef: RefObject<HTMLInputElement | null>;
  onRegisterChange: (id: string) => void;
  onStaffChange: (id: string) => void;
  onFulfillmentChange: (value: "PICKUP" | "DINE_IN" | "DELIVERY") => void;
  onBumpLine: (key: string, delta: number) => void;
  onRemoveLine: (key: string) => void;
  onCustomerQueryChange: (value: string) => void;
  onSelectCustomer: (customer: PosCustomerPick) => void;
  onClearCustomer: () => void;
  onToggleQuickCustomer: () => void;
  onQuickNameChange: (value: string) => void;
  onQuickEmailChange: (value: string) => void;
  onQuickPhoneChange: (value: string) => void;
  onQuickCreateCustomer: () => void;
};

export type PosTerminalModifierPanelProps = {
  showSecondaryPanels: boolean;
  canApplyPosDiscount: boolean;
  managerOverrideInput: PosManagerOverrideChecklistInput;
  showManagerOverrideHero: boolean;
  discountMode: PosTerminalDiscountMode;
  paymentMode: PaymentModeKey;
  fixedDiscountInput: string;
  percentDiscountInput: string;
  fixedDiscountInvalid: boolean;
  percentDiscountInvalid: boolean;
  onResetDiscount: () => void;
  onDiscountModeChange: (mode: PosTerminalDiscountMode) => void;
  onFixedDiscountInputChange: (value: string) => void;
  onPercentDiscountInputChange: (value: string) => void;
  onCompSale: () => void;
  onClearCompIfNeeded: () => void;
};

export type PosTerminalPaymentPanelProps = {
  availablePaymentModes: PaymentModeKey[];
  paymentMode: PaymentModeKey;
  canApplyPosDiscount: boolean;
  showSecondaryPanels: boolean;
  offlineCardLast4: string;
  offlineCardBrand: string;
  selectedCustomer: PosCustomerPick | null;
  loyaltyPointsRedeem: string;
  giftCardCode: string;
  loyaltyBalance: number | null;
  giftCardBalance: number | null;
  onPaymentModeChange: (mode: PaymentModeKey) => void;
  onOfflineCardLast4Change: (value: string) => void;
  onOfflineCardBrandChange: (value: string) => void;
  onLoyaltyPointsRedeemChange: (value: string) => void;
  onGiftCardCodeChange: (value: string) => void;
};

export type PosTerminalReceiptPanelProps = {
  cartTotal: number;
  appliedDiscountAmount: number;
  amountDue: number;
  speedMode: boolean;
  pending: boolean;
  checkoutStatus: PosCheckoutStatus | null;
  pendingTerminal: { orderId: string; amount: number } | null;
  onCheckout: () => void;
  onTerminalSuccess: () => void;
  onTerminalError: (error: string) => void;
};
