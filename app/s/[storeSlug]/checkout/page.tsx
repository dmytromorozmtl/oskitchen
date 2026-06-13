import { notFound } from "next/navigation";

import { StoreCheckoutClient } from "@/components/storefront/store-checkout-client";
import { getSessionUser } from "@/lib/auth";
import { checkoutExtensionsFromKitchenSettings } from "@/lib/storefront/checkout-extensions";
import { buildStorefrontCommerceMetadata } from "@/lib/storefront/page-metadata";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { mergeKitchenLegacyTax, parseTaxSettingsFromSettingsCenter } from "@/lib/storefront/tax-settings";
import { getStorefrontForPublicFromRequest, isStorefrontInClosureWindow } from "@/lib/storefront/public-access";
import { prisma } from "@/lib/prisma";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";
import { storefrontPaymentReadiness } from "@/services/storefront/storefront-payment-service";
import { getAvailablePickupWindows } from "@/services/storefront/pickup-slots";
import { getOrCreateLoyaltyProgram } from "@/services/storefront/loyalty-service";

/** ISR aligned with menu catalog cache (60s + revalidateTag on publish). */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  return buildStorefrontCommerceMetadata(storeSlug, "checkout", user?.id ?? null);
}

export default async function StorefrontCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const marketQ = typeof sp.market === "string" ? sp.market : undefined;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  const data = await loadStorefrontMenuCatalogForPage(storeSlug, marketQ);
  if (!sf?.activeMenu || !data) notFound();

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: sf.userId },
    select: {
      defaultTaxRate: true,
      taxDisplayName: true,
      taxIncludedInPrices: true,
      deliveryFee: true,
      settingsCenterJson: true,
    },
  });
  const extensions = checkoutExtensionsFromKitchenSettings(kitchen?.settingsCenterJson);
  const taxSettings = mergeKitchenLegacyTax(parseTaxSettingsFromSettingsCenter(kitchen?.settingsCenterJson), {
    defaultTaxRate: kitchen?.defaultTaxRate != null ? Number(kitchen.defaultTaxRate) : null,
    taxDisplayName: kitchen?.taxDisplayName ?? null,
    taxIncludedInPrices: kitchen?.taxIncludedInPrices === true,
  });

  const configuredDelivery =
    sf.storefrontDeliveryFee != null ? Number(sf.storefrontDeliveryFee) : Number(kitchen?.deliveryFee ?? 0);
  const freeThreshold = sf.freeDeliveryThreshold != null ? Number(sf.freeDeliveryThreshold) : null;

  const orderingPaused = isStorefrontInClosureWindow(sf);
  const minimumOrderAmount = sf.minimumOrderAmount != null ? Number(sf.minimumOrderAmount) : null;
  const requireTerms = Boolean(sf.termsText?.trim());
  const paymentReadiness = storefrontPaymentReadiness(sf);
  const pickupWindows =
    sf.pickupEnabled && sf.userId
      ? await getAvailablePickupWindows(storeSlug, sf.userId)
      : [];
  const loyaltyProgramRow = await getOrCreateLoyaltyProgram(sf.id, sf.userId);
  const loyaltyProgram = loyaltyProgramRow.isActive
    ? {
        pointsPerDollar: Number(loyaltyProgramRow.pointsPerDollar),
        redeemPoints: loyaltyProgramRow.redeemPoints,
        redeemAmount: Number(loyaltyProgramRow.redeemAmount),
        minPointsToRedeem: loyaltyProgramRow.minPointsToRedeem,
      }
    : null;

  return (
    <StoreCheckoutClient
      slug={storeSlug}
      currency={data.currency}
      products={data.catalog.products}
      priceVersion={data.catalog.priceVersion}
      pickupEnabled={sf.pickupEnabled}
      deliveryEnabled={sf.deliveryEnabled}
      orderingPaused={orderingPaused}
      minimumOrderAmount={minimumOrderAmount}
      deliveryFeeFlat={configuredDelivery}
      freeDeliveryThreshold={freeThreshold}
      requireTerms={requireTerms}
      payLaterOnly={sf.payLaterOnly}
      onlineCheckoutAllowed={paymentReadiness.allowed}
      onlineCheckoutBlockedReason={paymentReadiness.blockedReason}
      stripeMode={
        paymentReadiness.stripeReady &&
        (paymentReadiness.stripeMode === "test" || paymentReadiness.stripeMode === "live")
          ? paymentReadiness.stripeMode
          : null
      }
      termsText={sf.termsText?.trim() || null}
      privacyText={sf.privacyText?.trim() || null}
      turnstileSiteKey={turnstileSiteKey()}
      tipsEnabled={extensions.tipsEnabled}
      tipPresetsPercent={extensions.tipPresetsPercent}
      marketId={data.marketId}
      taxSettings={taxSettings}
      pickupWindows={pickupWindows}
      loyaltyProgram={loyaltyProgram}
    />
  );
}
