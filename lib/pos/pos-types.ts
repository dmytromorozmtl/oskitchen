import type {
  PosCartStatus,
  PosShiftStatus,
  PosTerminalMode,
  PosTerminalStatus,
  PosTransactionStatus,
} from "@prisma/client";

export type {
  PosCartStatus,
  PosShiftStatus,
  PosTerminalMode,
  PosTerminalStatus,
  PosTransactionStatus,
};

/** Cart line persisted in `POSCart.cartJson` (draft / held). */
export type PosCartLineJson = {
  id: string;
  productId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  modifiers?: string[];
};

export type PosCartJson = {
  version: 1;
  lines: PosCartLineJson[];
  orderNotes?: string;
  fulfillmentDetail?: string;
};
