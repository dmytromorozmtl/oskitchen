/**
 * Commercial demo seed — full launch workspace (30 products, 15 orders, staff, inventory, storefront).
 *
 * Usage:
 *   SEED_USER_ID=<supabase-uuid> npm run db:seed-demo
 */
import { parseDemoVertical, type DemoVerticalSlug } from "@/lib/demo-verticals";
import { prisma } from "@/lib/prisma";
import { seedCommercialDemoWorkspace } from "@/services/demo/commercial-demo-seed";

async function main() {
  const userId = process.env.SEED_USER_ID?.trim();
  if (!userId) {
    console.error("Set SEED_USER_ID to your Supabase auth user UUID.");
    process.exit(1);
  }

  const vertical = parseDemoVertical(process.env.DEMO_VERTICAL ?? "restaurant") as DemoVerticalSlug;

  console.log(`Seeding commercial demo for ${userId} (${vertical})…`);
  await seedCommercialDemoWorkspace(userId, vertical);
  console.log("✓ 30 products · 15 orders · 5 staff · inventory · production · storefront");
  console.log("Open /dashboard/today");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
