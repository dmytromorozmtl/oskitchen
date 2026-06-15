"use client";

import { StripeTerminalCheckout } from "@/components/pos/stripe-terminal-reader";

export { StripeTerminalCheckout };

/** @deprecated Use StripeTerminalCheckout inside StripeTerminalProvider */
export function TapToPayButton(props: {
  amount: number;
  orderId: string;
  onSuccess: (transaction: unknown) => void;
  onError?: (message: string) => void;
}) {
  return <StripeTerminalCheckout {...props} />;
}
