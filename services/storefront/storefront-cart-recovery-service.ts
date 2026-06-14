import { randomBytes } from "crypto";

import { cartRecoveryEmailTemplate } from "@/lib/email/templates/cart-recovery";
import { sendRawEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { storefrontCanonicalBase } from "@/lib/storefront/seo";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;
const SEVENTY_TWO_HOURS_MS = 72 * ONE_HOUR_MS;

function unsubscribeUrl(recoveryToken: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}/api/storefront/cart-recovery/unsubscribe?token=${encodeURIComponent(recoveryToken)}`;
}

export async function upsertStorefrontCartRecovery(input: {
  storefrontId: string;
  storeSlug: string;
  customerEmail: string;
  cart: Record<string, number>;
  marketingConsent?: boolean;
}): Promise<string> {
  const email = input.customerEmail.trim().toLowerCase();
  const token = randomBytes(24).toString("hex");
  const now = new Date();
  const existing = await prisma.storefrontCartRecovery.findFirst({
    where: { storefrontId: input.storefrontId, customerEmail: email, convertedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) {
    await prisma.storefrontCartRecovery.update({
      where: { id: existing.id },
      data: {
        cartJson: input.cart,
        recoveryToken: token,
        updatedAt: now,
        ...(input.marketingConsent ? { marketingConsentAt: existing.marketingConsentAt ?? now } : {}),
      },
    });
    return token;
  }
  await prisma.storefrontCartRecovery.create({
    data: {
      storefrontId: input.storefrontId,
      customerEmail: email,
      cartJson: input.cart,
      recoveryToken: token,
      marketingConsentAt: input.marketingConsent ? now : null,
    },
  });
  return token;
}

export async function loadCartRecoveryByToken(token: string): Promise<{
  storeSlug: string;
  cart: Record<string, number>;
} | null> {
  const row = await prisma.storefrontCartRecovery.findUnique({
    where: { recoveryToken: token },
    include: { storefront: { select: { storeSlug: true } } },
  });
  if (!row || row.convertedAt) return null;
  const cart = row.cartJson as Record<string, number>;
  return { storeSlug: row.storefront.storeSlug, cart: typeof cart === "object" && cart ? cart : {} };
}

export async function markCartRecoveryConverted(storefrontId: string, customerEmail: string) {
  const email = customerEmail.trim().toLowerCase();
  await prisma.storefrontCartRecovery.updateMany({
    where: { storefrontId, customerEmail: email, convertedAt: null },
    data: { convertedAt: new Date() },
  });
}

export type CartRecoveryMetrics = {
  total: number;
  emailed: number;
  converted: number;
  recoveryRatePercent: number;
};

export type CartRecoveryDailyPoint = {
  date: string;
  tracked: number;
  emailed: number;
  converted: number;
};

export async function getStorefrontCartRecoveryDailyMetrics(
  storefrontId: string,
  days = 14,
): Promise<CartRecoveryDailyPoint[]> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await prisma.storefrontCartRecovery.findMany({
    where: { storefrontId, createdAt: { gte: since } },
    select: { createdAt: true, emailed1hAt: true, emailed24hAt: true, emailed72hAt: true, convertedAt: true },
  });

  const buckets = new Map<string, CartRecoveryDailyPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, tracked: 0, emailed: 0, converted: 0 });
  }

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    b.tracked++;
    if (row.emailed1hAt || row.emailed24hAt || row.emailed72hAt) b.emailed++;
    if (row.convertedAt) b.converted++;
  }

  return [...buckets.values()];
}

export async function getStorefrontCartRecoveryMetrics(storefrontId: string): Promise<CartRecoveryMetrics> {
  const [total, emailed, converted] = await Promise.all([
    prisma.storefrontCartRecovery.count({ where: { storefrontId } }),
    prisma.storefrontCartRecovery.count({
      where: {
        storefrontId,
        OR: [{ emailed1hAt: { not: null } }, { emailed24hAt: { not: null } }, { emailed72hAt: { not: null } }],
      },
    }),
    prisma.storefrontCartRecovery.count({ where: { storefrontId, convertedAt: { not: null } } }),
  ]);
  const recoveryRatePercent = emailed > 0 ? Math.round((converted / emailed) * 1000) / 10 : 0;
  return { total, emailed, converted, recoveryRatePercent };
}

async function sendRecoveryEmail(input: {
  row: {
    id: string;
    recoveryToken: string;
    customerEmail: string;
    marketingConsentAt: Date | null;
    unsubscribedAt: Date | null;
    storefront: StorefrontPublicPayload & { storeSlug: string; publicName: string };
  };
  variant: "1h" | "24h" | "72h";
  discountPercent?: number;
}): Promise<boolean> {
  if (input.row.unsubscribedAt) return false;
  if (!input.row.marketingConsentAt) return false;

  const base = storefrontCanonicalBase(input.row.storefront, input.row.storefront.storeSlug);
  const cartLink = `${base.replace(/\/$/, "")}/cart?recover=${encodeURIComponent(input.row.recoveryToken)}`;
  const unsub = unsubscribeUrl(input.row.recoveryToken);
  const name = input.row.storefront.publicName;

  const headline =
    input.variant === "1h"
      ? `Your cart at ${name}`
      : input.variant === "24h"
        ? `Still thinking about ${name}?`
        : `Last chance — ${name}`;
  const discountLine =
    input.variant === "24h" && input.discountPercent
      ? ` Use code SAVE5 at checkout for ${input.discountPercent}% off.`
      : input.variant === "72h" && input.discountPercent
        ? ` Use code SAVE10 at checkout for ${input.discountPercent}% off — offer ends soon.`
        : "";
  const body =
    input.variant === "1h"
      ? "You left items in your cart. Pick up where you left off — your selections are saved."
      : input.variant === "24h"
        ? `Your cart is still waiting. Come back when you are ready to checkout.${discountLine}`
        : `We saved your cart one more time.${discountLine}`;

  const html = cartRecoveryEmailTemplate({
    businessName: name,
    headline,
    body,
    ctaLabel: "Return to cart",
    ctaUrl: cartLink,
    unsubscribeUrl: unsub,
  });

  const ok = await sendRawEmail({
    to: input.row.customerEmail,
    subject: headline,
    text: `${body}\n\n${cartLink}\n\nUnsubscribe: ${unsub}`,
    html,
  });
  return Boolean(ok && !("skipped" in ok));
}

export async function processStorefrontCartRecoveryEmails(): Promise<{
  sent1h: number;
  sent24h: number;
  sent72h: number;
}> {
  const now = Date.now();
  let sent1h = 0;
  let sent24h = 0;
  let sent72h = 0;

  const storefrontSelect = {
    storeSlug: true,
    publicName: true,
    customDomain: true,
    primaryDomainMode: true,
    subdomain: true,
    locale: true,
    currency: true,
    enabled: true,
    published: true,
    seoTitle: true,
    seoDescription: true,
    description: true,
    heroImageUrl: true,
    seoImageUrl: true,
    robotsPolicy: true,
  } as const;

  const pending1h = await prisma.storefrontCartRecovery.findMany({
    where: {
      convertedAt: null,
      unsubscribedAt: null,
      marketingConsentAt: { not: null },
      emailed1hAt: null,
      createdAt: { lte: new Date(now - ONE_HOUR_MS) },
      customerEmail: { not: null },
    },
    take: 50,
    include: { storefront: { select: storefrontSelect } },
  });

  for (const row of pending1h) {
    if (!row.customerEmail) continue;
    const sent = await sendRecoveryEmail({
      row: {
        ...row,
        customerEmail: row.customerEmail,
        storefront: row.storefront as unknown as StorefrontPublicPayload & {
          storeSlug: string;
          publicName: string;
        },
      },
      variant: "1h",
    });
    if (sent) {
      await prisma.storefrontCartRecovery.update({ where: { id: row.id }, data: { emailed1hAt: new Date() } });
      sent1h++;
    }
  }

  const pending24h = await prisma.storefrontCartRecovery.findMany({
    where: {
      convertedAt: null,
      unsubscribedAt: null,
      marketingConsentAt: { not: null },
      emailed24hAt: null,
      emailed1hAt: { not: null },
      createdAt: { lte: new Date(now - TWENTY_FOUR_HOURS_MS) },
      customerEmail: { not: null },
    },
    take: 50,
    include: { storefront: { select: storefrontSelect } },
  });

  for (const row of pending24h) {
    if (!row.customerEmail) continue;
    const sent = await sendRecoveryEmail({
      row: {
        ...row,
        customerEmail: row.customerEmail,
        storefront: row.storefront as unknown as StorefrontPublicPayload & {
          storeSlug: string;
          publicName: string;
        },
      },
      variant: "24h",
      discountPercent: 5,
    });
    if (sent) {
      await prisma.storefrontCartRecovery.update({
        where: { id: row.id },
        data: { emailed24hAt: new Date(), recoveryDiscountPercent: 5 },
      });
      sent24h++;
    }
  }

  const pending72h = await prisma.storefrontCartRecovery.findMany({
    where: {
      convertedAt: null,
      unsubscribedAt: null,
      marketingConsentAt: { not: null },
      emailed72hAt: null,
      emailed24hAt: { not: null },
      createdAt: { lte: new Date(now - SEVENTY_TWO_HOURS_MS) },
      customerEmail: { not: null },
    },
    take: 50,
    include: { storefront: { select: storefrontSelect } },
  });

  for (const row of pending72h) {
    if (!row.customerEmail) continue;
    const sent = await sendRecoveryEmail({
      row: {
        ...row,
        customerEmail: row.customerEmail,
        storefront: row.storefront as unknown as StorefrontPublicPayload & {
          storeSlug: string;
          publicName: string;
        },
      },
      variant: "72h",
      discountPercent: 10,
    });
    if (sent) {
      await prisma.storefrontCartRecovery.update({
        where: { id: row.id },
        data: { emailed72hAt: new Date(), recoveryDiscountPercent: 10 },
      });
      sent72h++;
    }
  }

  return { sent1h, sent24h, sent72h };
}
