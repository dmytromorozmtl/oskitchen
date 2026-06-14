import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  integrationConnectionListWhereForOwner,
  orderListWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

import type { GlobalSearchHit, GlobalSearchResponse } from "@/lib/search/search-types";

const MAX_PER_KIND = 5;
const MAX_TOTAL = 24;

function isUuidLike(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s.trim(),
  );
}

export async function runGlobalSearchForUser(userId: string, raw: string): Promise<GlobalSearchResponse> {
  const q = raw.trim().slice(0, 64);
  if (q.length < 2) return { hits: [], truncated: false };

  const mode = "insensitive" as const;
  const uuid = isUuidLike(q) ? q : null;

  const [orderWhere, productWhere, customerWhere, connectionWhere] = await Promise.all([
    orderListWhereForOwner(userId),
    productListWhereForOwner(userId),
    kitchenCustomerListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
  ]);

  const [
    orders,
    products,
    customers,
    tasks,
    tickets,
    brands,
    locations,
    routes,
    integrations,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        AND: [
          orderWhere,
          {
            OR: [
              { customerName: { contains: q, mode } },
              { customerEmail: { contains: q, mode } },
              ...(uuid ? [{ id: uuid }] : []),
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: MAX_PER_KIND,
      select: { id: true, customerName: true, status: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: {
        AND: [
          productWhere,
          {
            OR: [
              { title: { contains: q, mode } },
              { publicSlug: { contains: q, mode } },
              ...(uuid ? [{ id: uuid }] : []),
            ],
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: MAX_PER_KIND,
      select: { id: true, title: true, category: true },
    }),
    prisma.kitchenCustomer.findMany({
      where: {
        AND: [
          customerWhere,
          {
            OR: [
              { name: { contains: q, mode } },
              { displayName: { contains: q, mode } },
              { email: { contains: q, mode } },
              { companyName: { contains: q, mode } },
              ...(uuid ? [{ id: uuid }] : []),
            ],
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: MAX_PER_KIND,
      select: { id: true, name: true, displayName: true, email: true, companyName: true },
    }),
    prisma.kitchenTask.findMany({
      where: {
        userId,
        title: { contains: q, mode },
      },
      orderBy: { updatedAt: "desc" },
      take: MAX_PER_KIND,
      select: { id: true, title: true, status: true },
    }),
    prisma.supportTicket.findMany({
      where: {
        userId,
        OR: [
          { subject: { contains: q, mode } },
          ...(uuid ? [{ id: uuid }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: MAX_PER_KIND,
      select: { id: true, subject: true, status: true },
    }),
    prisma.brand.findMany({
      where: {
        workspace: { ownerUserId: userId },
        name: { contains: q, mode },
      },
      take: MAX_PER_KIND,
      select: { id: true, name: true, slug: true },
    }),
    prisma.location.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode } },
          { slug: { contains: q, mode } },
          ...(uuid ? [{ id: uuid }] : []),
        ],
      },
      take: MAX_PER_KIND,
      select: { id: true, name: true, slug: true },
    }),
    prisma.deliveryRoute.findMany({
      where: {
        userId,
        OR: [
          ...(uuid ? [{ id: uuid }] : []),
          { title: { contains: q, mode } },
        ],
      },
      take: MAX_PER_KIND,
      select: { id: true, status: true, routeDate: true, title: true },
    }),
    prisma.integrationConnection.findMany({
      where: {
        AND: [
          connectionWhere,
          {
            OR: [
              { name: { contains: q, mode } },
              { shopDomain: { contains: q, mode } },
              ...(uuid ? [{ id: uuid }] : []),
            ],
          },
        ],
      },
      take: MAX_PER_KIND,
      select: { id: true, name: true, provider: true, status: true },
    }),
  ]);

  const hits: GlobalSearchHit[] = [];

  for (const o of orders) {
    hits.push({
      kind: "order",
      id: o.id,
      title: o.customerName,
      subtitle: `${o.status} · ${o.createdAt.toISOString().slice(0, 10)}`,
      href: `/dashboard/orders/${o.id}`,
    });
  }
  for (const p of products) {
    hits.push({
      kind: "product",
      id: p.id,
      title: p.title,
      subtitle: String(p.category),
      href: `/dashboard/products/${p.id}`,
    });
  }
  for (const c of customers) {
    hits.push({
      kind: "customer",
      id: c.id,
      title: c.displayName ?? c.name ?? c.email,
      subtitle: c.email,
      href: `/dashboard/customers/${c.id}`,
    });
  }
  for (const t of tasks) {
    hits.push({
      kind: "task",
      id: t.id,
      title: t.title,
      subtitle: t.status,
      href: `/dashboard/tasks/${t.id}`,
    });
  }
  for (const s of tickets) {
    hits.push({
      kind: "support_ticket",
      id: s.id,
      title: s.subject,
      subtitle: s.status,
      href: `/dashboard/support/${s.id}`,
    });
  }
  for (const b of brands) {
    hits.push({
      kind: "brand",
      id: b.id,
      title: b.name,
      subtitle: b.slug,
      href: `/dashboard/brands/${b.id}`,
    });
  }
  for (const l of locations) {
    hits.push({
      kind: "location",
      id: l.id,
      title: l.name,
      subtitle: l.slug,
      href: `/dashboard/locations/${l.id}`,
    });
  }
  for (const r of routes) {
    hits.push({
      kind: "route",
      id: r.id,
      title: r.title?.trim() ? r.title : `Route ${r.id.slice(0, 8)}…`,
      subtitle: `${r.status} · ${r.routeDate.toISOString().slice(0, 10)}`,
      href: `/dashboard/routes/${r.id}`,
    });
  }
  for (const i of integrations) {
    hits.push({
      kind: "integration",
      id: i.id,
      title: i.name,
      subtitle: `${i.provider} · ${i.status}`,
      href: `/dashboard/sales-channels/connections/${i.id}`,
    });
  }

  const truncated = hits.length > MAX_TOTAL;
  return { hits: hits.slice(0, MAX_TOTAL), truncated };
}
