/**
 * Storefront online payments must not be enabled unless Stripe server credentials exist.
 * Never log secret values.
 */
export function isStripeSecretConfigured(): boolean {
  const sk = process.env.STRIPE_SECRET_KEY?.trim();
  if (sk && (sk.startsWith("sk_test_") || sk.startsWith("sk_live_"))) return true;
  const restricted = process.env.STRIPE_RESTRICTED_KEY?.trim();
  if (restricted && restricted.startsWith("rk_")) return true;
  return false;
}

export function stripeReadinessSummary(): {
  ready: boolean;
  mode: "test" | "live" | "unknown";
  message: string;
} {
  const sk = process.env.STRIPE_SECRET_KEY?.trim();
  if (!sk) {
    return {
      ready: false,
      mode: "unknown",
      message: "Set STRIPE_SECRET_KEY (sk_test_… or sk_live_…) on the server to enable online payments.",
    };
  }
  const test = sk.startsWith("sk_test_");
  return {
    ready: true,
    mode: test ? "test" : "live",
    message: test
      ? "Stripe test mode key detected — use test cards only."
      : "Stripe live mode key detected — ensure webhooks and PCI scope are production-ready.",
  };
}
