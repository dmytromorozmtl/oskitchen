import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const STOREFRONT_CUSTOMER_COOKIE = "kos_sf_customer";

/** Returns authenticated storefront customer context when Supabase session email matches a customer record. */
export async function getStorefrontCustomerSession(storeSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug, enabled: true, published: true },
    select: { id: true, storeSlug: true, publicName: true },
  });
  if (!sf) return null;

  const email = user.email.trim().toLowerCase();
  const customer = await prisma.storefrontCustomer.findUnique({
    where: { storefrontId_email: { storefrontId: sf.id, email } },
  });

  if (!customer) {
    await prisma.storefrontCustomer.create({
      data: {
        storefrontId: sf.id,
        email,
        supabaseUserId: user.id,
      },
    });
  } else if (!customer.supabaseUserId) {
    await prisma.storefrontCustomer.update({
      where: { id: customer.id },
      data: { supabaseUserId: user.id },
    });
  }

  return {
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    publicName: sf.publicName,
    email,
    supabaseUserId: user.id,
  };
}

export async function clearStorefrontCustomerCookie() {
  const jar = await cookies();
  jar.set(STOREFRONT_CUSTOMER_COOKIE, "", { path: "/", maxAge: 0 });
}
