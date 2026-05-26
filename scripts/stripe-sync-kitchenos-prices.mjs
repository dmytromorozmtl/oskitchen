#!/usr/bin/env node
/**
 * Resolve KitchenOS Stripe Price IDs from Product IDs and print Vercel env commands.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-sync-kitchenos-prices.mjs
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-sync-kitchenos-prices.mjs --write-vercel
 */
const PRODUCTS = {
  NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID: { productId: "prod_UXY8NOISaMt9lY", amount: 2900 },
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: { productId: "prod_UXY85wJLW7Umrh", amount: 7900 },
  NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID: { productId: "prod_UXY8wTFnxuMbLj", amount: 19900 },
};

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("Set STRIPE_SECRET_KEY (sk_live_... or sk_test_...)");
  process.exit(1);
}

async function stripe(path, init) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

async function resolvePrice(productId, amount) {
  const product = await stripe(`/products/${productId}`, { method: "GET" });
  const dp = product.default_price;
  if (typeof dp === "string" && dp.startsWith("price_")) return dp;
  if (dp && typeof dp === "object" && dp.id?.startsWith("price_")) return dp.id;

  const list = await stripe(`/prices?product=${productId}&active=true&limit=20`, { method: "GET" });
  const monthly = list.data?.find((p) => p.recurring?.interval === "month");
  if (monthly?.id) return monthly.id;

  const body = new URLSearchParams({
    product: productId,
    "recurring[interval]": "month",
    currency: "usd",
    unit_amount: String(amount),
  });
  const created = await stripe("/prices", { method: "POST", body });
  return created.id;
}

const writeVercel = process.argv.includes("--write-vercel");
const { spawnSync } = await import("node:child_process");

console.log("\nKitchenOS Stripe price IDs:\n");
for (const [envName, { productId, amount }] of Object.entries(PRODUCTS)) {
  const priceId = await resolvePrice(productId, amount);
  console.log(`${envName}=${priceId}  (product ${productId})`);
  if (writeVercel) {
    spawnSync("vercel", ["env", "rm", envName, "production", "--yes"], { stdio: "inherit" });
    const r = spawnSync("vercel", ["env", "add", envName, "production"], {
      input: priceId,
      encoding: "utf8",
      stdio: ["pipe", "inherit", "inherit"],
    });
    if (r.status !== 0) {
      console.error(`Failed to set ${envName} — run manually:`);
      console.error(`  echo "${priceId}" | vercel env add ${envName} production`);
    }
  }
}
console.log("\nThen: vercel build --prod --yes && vercel deploy --prebuilt --prod --yes\n");
