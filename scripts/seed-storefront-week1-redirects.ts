/**
 * Seed two Week-1 redirect rules for a pilot storefront (idempotent).
 *   STOREFRONT_PILOT_SLUG=hello npm run storefront:seed-week1-redirects
 *
 * Loads .env.local + .env.production.local via dotenv parser (do not `source` in zsh).
 */
import { prisma } from "@/lib/prisma";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";
import { normalizeStorefrontRelativePath } from "@/lib/storefront/storefront-redirects";

const DEFAULT_RULES = [
  { fromPath: "/legacy-menu", toPath: "/menu", httpStatus: 301 },
  { fromPath: "/order-now", toPath: "/menu", httpStatus: 302 },
] as const;

async function main(): Promise<void> {
  const loaded = loadStorefrontScriptEnv();
  if (loaded.length) console.log(`Env: ${loaded.join(", ")}\n`);

  const slug = (process.env.STOREFRONT_PILOT_SLUG ?? "hello").trim();
  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: slug },
    select: { id: true, storeSlug: true, publicName: true },
  });
  if (!sf) {
    console.error(`No storefront for slug "${slug}"`);
    process.exitCode = 1;
    return;
  }

  console.log(`Seeding redirects for ${sf.publicName} (${sf.storeSlug})…\n`);

  for (const rule of DEFAULT_RULES) {
    const fromPath = normalizeStorefrontRelativePath(rule.fromPath);
    const toPath = normalizeStorefrontRelativePath(rule.toPath);
    await prisma.storefrontRedirect.upsert({
      where: { storefrontId_fromPath: { storefrontId: sf.id, fromPath } },
      create: {
        storefrontId: sf.id,
        fromPath,
        toPath,
        httpStatus: rule.httpStatus,
        active: true,
      },
      update: { toPath, httpStatus: rule.httpStatus, active: true },
    });
    console.log(`  ✓ ${fromPath} → ${toPath} (${rule.httpStatus})`);
  }

  console.log("\nSmoke (after STOREFRONT_REDIRECTS_ENABLED=true + redeploy):");
  console.log(`  STOREFRONT_SMOKE_BASE_URL=<host> STOREFRONT_SMOKE_SLUG=${slug} \\`);
  console.log(`  STOREFRONT_REDIRECT_FROM=/legacy-menu STOREFRONT_REDIRECT_TO=/menu \\`);
  console.log(`  npm run smoke:storefront-redirects`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
