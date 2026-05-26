import { VisualCheckoutShell } from "@/components/storefront/visual-checkout-shell";

/** Isolated checkout shell for Playwright visual baselines. */
export default function VisualTestCheckoutShellPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <VisualCheckoutShell />
    </div>
  );
}
