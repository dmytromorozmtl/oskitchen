/**
 * Pure helpers for cross-channel guest identity (Blueprint P2-115).
 */

import { CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID } from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";

export type GuestChannel = "pos" | "storefront" | "delivery";

export type ChannelTouchpoint = {
  channel: GuestChannel;
  orderCount: number;
  lifetimeValueUsd: number;
  lastOrderAtIso: string | null;
};

export type CrossChannelGuestRow = {
  guestKey: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  channels: GuestChannel[];
  totalOrders: number;
  lifetimeValueUsd: number;
  unifiedProfileHref: string;
};

export type CrossChannelGuestIdentityReport = {
  policyId: typeof CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID;
  guestCount: number;
  multiChannelCount: number;
  posLinkedCount: number;
  storefrontLinkedCount: number;
  deliveryLinkedCount: number;
  guests: CrossChannelGuestRow[];
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function normalizeGuestKey(input: {
  email?: string | null;
  phone?: string | null;
}): string | null {
  const email = input.email?.trim().toLowerCase();
  if (email && !email.includes("@guest.local")) return `email:${email}`;

  const phone = input.phone?.replace(/\D/g, "");
  if (phone && phone.length >= 10) return `phone:${phone}`;

  return null;
}

export function classifyChannelFromSource(source: string): GuestChannel {
  const upper = source.toUpperCase();
  if (
    upper === "MANUAL" ||
    upper === "PHONE_ORDER" ||
    upper === "EMAIL_ORDER" ||
    upper === "BAR_EVENT_INQUIRY"
  ) {
    return "pos";
  }
  if (upper === "STOREFRONT" || upper === "BAKERY_PREORDER" || upper === "MEAL_PLAN") {
    return "storefront";
  }
  return "delivery";
}

export function aggregateChannelTouchpoints(
  orders: ReadonlyArray<{ channel: GuestChannel; totalUsd: number; createdAtIso: string }>,
): ChannelTouchpoint[] {
  const byChannel = new Map<GuestChannel, { orderCount: number; lifetimeValueUsd: number; lastOrderAtIso: string | null }>();

  for (const order of orders) {
    const row = byChannel.get(order.channel) ?? {
      orderCount: 0,
      lifetimeValueUsd: 0,
      lastOrderAtIso: null,
    };
    row.orderCount += 1;
    row.lifetimeValueUsd += order.totalUsd;
    if (!row.lastOrderAtIso || order.createdAtIso > row.lastOrderAtIso) {
      row.lastOrderAtIso = order.createdAtIso;
    }
    byChannel.set(order.channel, row);
  }

  return [...byChannel.entries()].map(([channel, data]) => ({
    channel,
    orderCount: data.orderCount,
    lifetimeValueUsd: roundMoney(data.lifetimeValueUsd),
    lastOrderAtIso: data.lastOrderAtIso,
  }));
}

export function buildCrossChannelGuestRow(input: {
  guestKey: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  customerId: string;
  orders: ReadonlyArray<{ channel: GuestChannel; totalUsd: number; createdAtIso: string }>;
}): CrossChannelGuestRow {
  const touchpoints = aggregateChannelTouchpoints(input.orders);
  const channels = touchpoints.map((t) => t.channel);

  return {
    guestKey: input.guestKey,
    displayName: input.displayName,
    email: input.email,
    phone: input.phone,
    channels,
    totalOrders: input.orders.length,
    lifetimeValueUsd: roundMoney(input.orders.reduce((s, o) => s + o.totalUsd, 0)),
    unifiedProfileHref: `/dashboard/customers/unified-profile/${input.customerId}`,
  };
}

export function buildCrossChannelGuestIdentityReport(input: {
  guests: CrossChannelGuestRow[];
}): CrossChannelGuestIdentityReport {
  const multiChannelCount = input.guests.filter((g) => g.channels.length > 1).length;
  const posLinkedCount = input.guests.filter((g) => g.channels.includes("pos")).length;
  const storefrontLinkedCount = input.guests.filter((g) => g.channels.includes("storefront")).length;
  const deliveryLinkedCount = input.guests.filter((g) => g.channels.includes("delivery")).length;

  return {
    policyId: CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
    guestCount: input.guests.length,
    multiChannelCount,
    posLinkedCount,
    storefrontLinkedCount,
    deliveryLinkedCount,
    guests: input.guests.sort((a, b) => b.lifetimeValueUsd - a.lifetimeValueUsd),
  };
}

export const CROSS_CHANNEL_GUEST_IDENTITY_DEMO_GUESTS = [
  {
    guestKey: "email:jordan@example.com",
    displayName: "Jordan Lee",
    email: "jordan@example.com",
    phone: "+15551234567",
    customerId: "demo-cust-001",
    orders: [
      { channel: "pos" as const, totalUsd: 42.5, createdAtIso: "2026-06-08T12:00:00.000Z" },
      { channel: "storefront" as const, totalUsd: 68.0, createdAtIso: "2026-06-07T18:30:00.000Z" },
      { channel: "delivery" as const, totalUsd: 55.25, createdAtIso: "2026-06-06T19:15:00.000Z" },
    ],
  },
  {
    guestKey: "email:alex@example.com",
    displayName: "Alex Morgan",
    email: "alex@example.com",
    phone: null,
    customerId: "demo-cust-002",
    orders: [
      { channel: "storefront" as const, totalUsd: 31.0, createdAtIso: "2026-06-08T09:00:00.000Z" },
      { channel: "storefront" as const, totalUsd: 28.5, createdAtIso: "2026-06-05T11:00:00.000Z" },
    ],
  },
  {
    guestKey: "phone:15559876543",
    displayName: "Sam Rivera",
    email: null,
    phone: "+15559876543",
    customerId: "demo-cust-003",
    orders: [
      { channel: "pos" as const, totalUsd: 19.75, createdAtIso: "2026-06-08T14:00:00.000Z" },
      { channel: "delivery" as const, totalUsd: 44.0, createdAtIso: "2026-06-04T20:00:00.000Z" },
    ],
  },
] as const;

export function buildCrossChannelGuestIdentityDemoReport(): CrossChannelGuestIdentityReport {
  const guests = CROSS_CHANNEL_GUEST_IDENTITY_DEMO_GUESTS.map((row) =>
    buildCrossChannelGuestRow(row),
  );
  return buildCrossChannelGuestIdentityReport({ guests });
}

export function hasMultiChannelIdentity(report: CrossChannelGuestIdentityReport): boolean {
  return report.multiChannelCount > 0;
}
