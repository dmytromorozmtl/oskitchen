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
  clearWorkspaceSampleData,
  previewWorkspaceSampleDataClear,
} from "@/services/demo-data";

function parseArg(name: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1]?.trim();
}

function printUsage(): void {
  console.log(
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

  console.log(`=== Demo tenant reset ${execute ? "(EXECUTE)" : "(DRY-RUN)"} ===\n`);
  console.log(`Email: ${user.email}`);
  console.log(`Owner userId: ${user.id}`);
  console.log(`Workspace: ${workspace?.name ?? "—"} (${workspace?.id ?? "—"})`);
  console.log(`Business: ${settings?.businessName ?? "—"}`);
  console.log(`Onboarding completed: ${user.onboardingCompleted ? "yes" : "no"}`);
  console.log(`Demo mode: ${settings?.demoMode ? "ON" : "OFF"}\n`);

  console.log("Rows that would be cleared by demo reset:");
  for (const [key, value] of Object.entries(preview)) {
    console.log(`  ${key.padEnd(22)} ${value}`);
  }

  if (preflightBefore) {
    console.log("\nPreflight before:");
    for (const gate of preflightBefore.gates) {
      console.log(`  ${gate.ok ? "OK  " : "FAIL"} ${gate.label}${gate.detail ? ` — ${gate.detail}` : ""}`);
    }
  }

  if (!execute) {
    console.log(
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
  console.log("\nReset complete. Demo mode disabled.");
  if (preflightAfter) {
    console.log("\nPreflight after:");
    for (const gate of preflightAfter.gates) {
      console.log(`  ${gate.ok ? "OK  " : "FAIL"} ${gate.label}${gate.detail ? ` — ${gate.detail}` : ""}`);
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
