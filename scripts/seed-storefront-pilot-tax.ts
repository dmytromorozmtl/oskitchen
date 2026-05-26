/**
 * P0 — Configure pilot storefront tax preset + verify weekday market.
 *
 * Usage:
 *   npm run storefront:seed-pilot-tax
 *   STOREFRONT_PILOT_SLUG=hello STOREFRONT_TAX_PRESET=ca_sales npm run storefront:seed-pilot-tax
 */
import { PrismaClient } from "@prisma/client";

import { presetTaxSettings, type TaxJurisdictionMode } from "@/lib/storefront/tax-settings";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

loadStorefrontScriptEnv();

const SLUG = process.env.STOREFRONT_PILOT_SLUG?.trim() || "hello";
const PRESET = (process.env.STOREFRONT_TAX_PRESET?.trim() || "ca_sales") as TaxJurisdictionMode;
const prisma = new PrismaClient();

async function main() {
  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: SLUG },
    select: { id: true, storeSlug: true, userId: true, currency: true },
  });
  if (!sf) {
    console.error(`No storefront with slug "${SLUG}".`);
    process.exit(1);
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: sf.userId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object"
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};
  const sfBlock =
    center.storefront && typeof center.storefront === "object"
      ? { ...(center.storefront as Record<string, unknown>) }
      : {};

  let tax = presetTaxSettings(PRESET);
  if (PRESET === "ca_sales") {
    tax = {
      ...tax,
      regionCode: "CA-BC",
      components: [
        { id: "gst", label: "GST", ratePercent: 5, appliesTo: "goods" },
        { id: "pst", label: "PST", ratePercent: 7, appliesTo: "goods" },
      ],
    };
  } else if (PRESET === "us_sales") {
    tax = {
      ...tax,
      regionCode: "US-CA",
      components: [
        { id: "state", label: "CA sales tax", ratePercent: 7.25, appliesTo: "goods" },
        { id: "local", label: "Local district", ratePercent: 1.98, appliesTo: "goods" },
      ],
    };
  }

  const markets = Array.isArray(sfBlock.markets) ? sfBlock.markets : [];
  const hasWeekday = markets.some(
    (m) => typeof m === "object" && m && (m as { id?: string }).id === "weekday",
  );

  sfBlock.tax = tax;
  center.storefront = sfBlock;

  await prisma.kitchenSettings.upsert({
    where: { userId: sf.userId },
    create: { userId: sf.userId, settingsCenterJson: center },
    update: { settingsCenterJson: center },
  });

  console.log(`✓ Tax preset "${PRESET}" saved for storefront "${SLUG}"`);
  console.log(`  Components: ${tax.components.map((c) => `${c.label} ${c.ratePercent}%`).join(" + ")}`);
  if (!hasWeekday) {
    console.warn("⚠ No weekday market in settings — run: npm run storefront:seed-phase2-hello");
  } else {
    console.log("✓ weekday market present — test: /s/" + SLUG + "?market=weekday");
  }
  console.log("\nQA:");
  console.log("  1. Dashboard → Storefront → Ordering → Sales tax & VAT (verify saved)");
  console.log("  2. Checkout — stacked tax lines");
  console.log("  3. Place order → /dashboard/orders/[id] — Storefront preorder card");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
