"use client";

import { useEffect, useState } from "react";

import { CustomerDisplay } from "@/components/pos/customer-display";
import {
  subscribePosCustomerDisplayState,
  type PosCustomerDisplayState,
} from "@/lib/pos/pos-multi-monitor";

const EMPTY_STATE: PosCustomerDisplayState = {
  registerName: "Register",
  lines: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  paymentLabel: "Cash",
  updatedAtIso: new Date(0).toISOString(),
};

/** BroadcastChannel subscriber — mounts {@link CustomerDisplay} on the second screen. */
export function PosCustomerDisplayClient() {
  const [state, setState] = useState<PosCustomerDisplayState>(EMPTY_STATE);

  useEffect(() => subscribePosCustomerDisplayState(setState), []);

  return (
    <CustomerDisplay
      registerName={state.registerName}
      lines={state.lines}
      subtotal={state.subtotal}
      discount={state.discount}
      total={state.total}
      paymentLabel={state.paymentLabel}
    />
  );
}
