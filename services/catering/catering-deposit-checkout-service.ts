import { getStripeClient } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";

export type CateringDepositCheckoutInput = {
  orderId: string;
  quoteNumber: string | null;
  depositAmount: number;
  currency?: string;
  customerEmail?: string | null;
};

export async function createCateringDepositCheckoutSession(
  input: CateringDepositCheckoutInput,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const amountMinor = Math.round(input.depositAmount * 100);
  if (!Number.isFinite(amountMinor) || amountMinor < 50) {
    return { ok: false, error: "Deposit amount is too small for card checkout." };
  }

  const currency = (input.currency ?? "usd").toLowerCase();
  const label = input.quoteNumber ? `Deposit — quote ${input.quoteNumber}` : "Catering deposit";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail?.trim() || undefined,
      success_url: `${SITE_URL}/dashboard/orders?deposit=success&orderId=${encodeURIComponent(input.orderId)}`,
      cancel_url: `${SITE_URL}/dashboard/catering-quotes?deposit=cancelled`,
      metadata: {
        purpose: "catering_deposit",
        orderId: input.orderId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountMinor,
            product_data: { name: label },
          },
        },
      ],
    });
    if (!session.url) return { ok: false, error: "Stripe did not return a checkout URL." };
    return { ok: true, url: session.url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Stripe checkout failed." };
  }
}
