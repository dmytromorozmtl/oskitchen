"use client";

import { useState } from "react";
import { toast } from "sonner";

import { retryPublicStorefrontPayment } from "@/actions/storefront-order";
import { Button } from "@/components/ui/button";

export function StorefrontPaymentRecoveryActions({
  orderToken,
  storeSlug,
}: {
  orderToken: string;
  storeSlug: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      className="mt-3 rounded-full"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const result = await retryPublicStorefrontPayment({ slug: storeSlug, token: orderToken });
        setPending(false);

        if (!("ok" in result) || !result.ok) {
          toast.error(result.error ?? "Could not restart card checkout.");
          return;
        }

        window.location.assign(result.stripeCheckoutUrl);
      }}
    >
      {pending ? "Preparing payment..." : "Retry card payment"}
    </Button>
  );
}
