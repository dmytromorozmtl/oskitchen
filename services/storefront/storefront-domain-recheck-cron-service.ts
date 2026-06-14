import { prisma } from "@/lib/prisma";
import { runStorefrontDomainVerification } from "@/services/storefront/storefront-domain-verification-service";

export async function recheckAllStorefrontDomains(): Promise<{
  checked: number;
  active: number;
  pending: number;
  errors: number;
}> {
  const rows = await prisma.storefrontSettings.findMany({
    where: {
      customDomain: { not: null },
      enabled: true,
    },
    select: { id: true, customDomain: true },
    take: 200,
  });

  let active = 0;
  let pending = 0;
  let errors = 0;

  for (const row of rows) {
    if (!row.customDomain?.trim()) continue;
    try {
      const run = await runStorefrontDomainVerification(row.id);
      if (run.status === "ACTIVE") active += 1;
      else if (run.status === "ERROR" || run.status === "DNS_MISSING") errors += 1;
      else pending += 1;
    } catch {
      errors += 1;
    }
  }

  return { checked: rows.length, active, pending, errors };
}
