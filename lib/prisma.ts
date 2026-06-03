import { PrismaClient } from "@prisma/client";

import { kitchenSettingsDemoExpiresColumnCompatExtension } from "@/lib/prisma-kitchen-settings-demo-column-compat";
import { storefrontFirstPartyColumnCompatExtension } from "@/lib/prisma-storefront-first-party-column-compat";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const base = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
  return base
    .$extends(storefrontFirstPartyColumnCompatExtension(base))
    .$extends(kitchenSettingsDemoExpiresColumnCompatExtension(base)) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
