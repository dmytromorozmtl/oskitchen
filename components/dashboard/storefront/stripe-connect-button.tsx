"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { startStorefrontStripeConnectAction } from "@/actions/storefront-stripe-connect";
import { Button } from "@/components/ui/button";

export function StripeConnectButton({ disabled }: { disabled?: boolean }) {
  const [pending, setPending] = React.useState(false);

  return (
    <Button
      type="button"
      className="rounded-full"
      disabled={disabled || pending}
      onClick={() => {
        setPending(true);
        void startStorefrontStripeConnectAction()
          .then((res) => {
            if ("error" in res && res.error) {
              toast.error(getActionError(res) ?? "Something went wrong");
              return;
            }
            if ("url" in res && res.url) {
              window.location.assign(res.url);
            }
          })
          .finally(() => setPending(false));
      }}
    >
      {pending ? "Opening Stripe…" : "Connect Stripe account"}
    </Button>
  );
}
