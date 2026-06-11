/**
 * Supervised demo-mode exit for a single tenant.
 *
 * Dry-run:
 *   npx tsx scripts/reset-demo-tenant.ts --email=owner@kitchen.com
 *
 * Execute (requires explicit guard):
 *   DEMO_MODE_ENABLED=true npx tsx scripts/reset-demo-tenant.ts --email=owner@kitchen.com --execute --confirm-email=owner@kitchen.com
 */
import { prisma } from "@/lib/prisma";
import { isDemoGloballyFlagged } from "@/lib/env";
import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";
import {
import { logger } from "@/lib/logger";
  clearWorkspaceSampleData,
  previewWorkspaceSampleDataClear,
} from "@/services/demo-data";

function parseArg(name: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1]?.trim();
}

function printUsage(): void {
  logger.cli(
    [
      "Usage:",
      "  npx tsx scripts/reset-demo-tenant.ts --email=owner@kitchen.com",
      "  DEMO_MODE_ENABLED=true npx tsx scripts/reset-demo-tenant.ts --email=owner@kitchen.com --execute --confirm-email=owner@kitchen.com",
    ].join("\n"),
  );
}

async function main() {
  const email = parseArg("email");
  const confirmEmail = parseArg("confirm-email");
  const execute = process.argv.includes("--execute");

  if (!email) {
    printUsage();
    process.exit(1);
  }

  const user = await prisma.userProfile.findUnique({
    where: { email },
    select: { id: true, email: true, onboardingCompleted: true },
  });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const [settings, workspace, preview, preflightBefore] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId: user.id },
      select: {
        businessName: true,
        businessType: true,
        demoMode: true,
        workspaceId: true,
      },
    }),
    prisma.workspace.findFirst({
      where: { ownerUserId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    previewWorkspaceSampleDataClear(user.id),
    runKitchenPreflight(email),
  ]);

  logger.cli(`=== Demo tenant reset ${execute ? "(EXECUTE)" : "(DRY-RUN)"} ===\n`);
  logger.cli(`Email: ${user.email}`);
  logger.cli(`Owner userId: ${user.id}`);
  logger.cli(`Workspace: ${workspace?.name ?? "—"} (${workspace?.id ?? "—"})`);
  logger.cli(`Business: ${settings?.businessName ?? "—"}`);
  logger.cli(`Onboarding completed: ${user.onboardingCompleted ? "yes" : "no"}`);
  logger.cli(`Demo mode: ${settings?.demoMode ? "ON" : "OFF"}\n`);

  logger.cli("Rows that would be cleared by demo reset:");
  for (const [key, value] of Object.entries(preview)) {
    logger.cli(`  ${key.padEnd(22)} ${value}`);
  }

  if (preflightBefore) {
    logger.cli("\nPreflight before:");
    for (const gate of preflightBefore.gates) {
      logger.cli(`  ${gate.ok ? "OK  " : "FAIL"} ${gate.label}${gate.detail ? ` — ${gate.detail}` : ""}`);
    }
  }

  if (!execute) {
    logger.cli(
      "\nDry-run only. Re-run with --execute and --confirm-email=<same email> after supervised approval.",
    );
    return;
  }

  if (!settings?.demoMode) {
    console.error("\nRefusing to execute: tenant is not in demo mode.");
    process.exit(1);
  }
  if (!isDemoGloballyFlagged()) {
    console.error("\nRefusing to execute: set DEMO_MODE_ENABLED=true for supervised production reset.");
    process.exit(1);
  }
  if (!confirmEmail || confirmEmail !== email) {
    console.error("\nRefusing to execute: pass --confirm-email=<same email> to confirm the target.");
    process.exit(1);
  }

  await clearWorkspaceSampleData(user.id);
  await prisma.kitchenSettings.update({
    where: { userId: user.id },
    data: { demoMode: false },
  });

  const preflightAfter = await runKitchenPreflight(email);
  logger.cli("\nReset complete. Demo mode disabled.");
  if (preflightAfter) {
    logger.cli("\nPreflight after:");
    for (const gate of preflightAfter.gates) {
      logger.cli(`  ${gate.ok ? "OK  " : "FAIL"} ${gate.label}${gate.detail ? ` — ${gate.detail}` : ""}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
