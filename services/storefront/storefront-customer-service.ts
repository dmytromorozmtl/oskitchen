import { prisma } from "@/lib/prisma";
import { buildStorefrontOrderCustomerEmailEqualsWhere } from "@/lib/storefront/storefront-order-pii";

export async function upsertStorefrontCustomer(input: {
  storefrontId: string;
  email: string;
  supabaseUserId?: string | null;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  await prisma.storefrontCustomer.upsert({
    where: {
      storefrontId_email: { storefrontId: input.storefrontId, email },
    },
    create: {
      storefrontId: input.storefrontId,
      email,
      supabaseUserId: input.supabaseUserId ?? null,
      lastOrderAt: new Date(),
    },
    update: {
      supabaseUserId: input.supabaseUserId ?? undefined,
      lastOrderAt: new Date(),
    },
  });
}

export async function linkStorefrontCustomerToSupabaseUser(input: {
  storefrontId: string;
  email: string;
  supabaseUserId: string;
}): Promise<void> {
  await upsertStorefrontCustomer(input);
}

export async function listStorefrontOrdersForCustomer(input: {
  storefrontId: string;
  email: string;
  supabaseUserId?: string | null;
}) {
  const email = input.email.trim().toLowerCase();

  if (input.supabaseUserId) {
    const linked = await prisma.storefrontCustomer.findFirst({
      where: { storefrontId: input.storefrontId, supabaseUserId: input.supabaseUserId },
    });
    const lookupEmail = linked?.email ?? email;
    return prisma.storefrontOrder.findMany({
      where: {
        AND: [
          {
            storefrontId: input.storefrontId,
            isTestOrder: false,
          },
          buildStorefrontOrderCustomerEmailEqualsWhere(lookupEmail),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        publicToken: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });
  }

  return prisma.storefrontOrder.findMany({
    where: {
      AND: [
        {
          storefrontId: input.storefrontId,
          isTestOrder: false,
        },
        buildStorefrontOrderCustomerEmailEqualsWhere(email),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      publicToken: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });
}
