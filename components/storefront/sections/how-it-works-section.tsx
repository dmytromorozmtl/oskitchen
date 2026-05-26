import { textBlockSchema } from "@/lib/storefront/sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";
import { isTemplateTextBody } from "@/lib/storefront/section-placeholders";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

export function HowItWorksSection({
  contentJson,
  storefront,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  storefront: StorefrontPublicPayload;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(textBlockSchema, contentJson, locale, defaultLocale);
  const heading = c?.heading?.trim() || "How it works";

  let body = c?.body?.trim() ?? "";
  if (!body || isTemplateTextBody(body)) {
    body = [
      "Browse the rotating menu and add items to your cart.",
      storefront.pickupEnabled && storefront.deliveryEnabled
        ? "Choose pickup or delivery at checkout."
        : storefront.pickupEnabled
          ? "Pickup-focused — select a slot at checkout."
          : storefront.deliveryEnabled
            ? "Delivery may be available at checkout."
            : "Check the menu for fulfillment options.",
      storefront.payLaterOnly
        ? "Submit a preorder — payment is arranged with the kitchen."
        : "Complete checkout to place your order.",
    ].join("\n\n");
  }

  return (
    <section className="py-6">
      <div className="sf-card rounded-2xl p-6 sm:p-8 dark:bg-gray-900/80">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{heading}</h2>
        <p className="mt-4 whitespace-pre-wrap text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </section>
  );
}
