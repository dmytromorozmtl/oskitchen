/**
 * Per-kitchen closed beta readiness (DB checks).
 *
 *   npm run beta:kitchen-preflight -- --email=chef@pilot.com
 */
import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";

async function main() {
  const email = process.argv.find((a) => a.startsWith("--email="))?.split("=")[1]?.trim();
  if (!email) {
    console.error("Usage: npm run beta:kitchen-preflight -- --email=owner@kitchen.com");
    process.exit(1);
  }

  const result = await runKitchenPreflight(email);
  if (!result) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`=== Closed beta preflight: ${email} ===\n`);
  for (const g of result.gates) {
    const tag = g.ok ? "OK" : "FAIL";
    console.log(`${tag.padEnd(5)} ${g.label}${g.detail ? ` — ${g.detail}` : ""}`);
  }

  console.log(
    `\nMetrics: orders=${result.metrics.orderCount} (7d=${result.metrics.ordersLast7d}) staff=${result.metrics.staffMembers} integrations=${result.metrics.integrations}`,
  );

  if (!result.ready) {
    const demoGateFailed = result.gates.some((g) => g.label === "Demo mode off" && !g.ok);
    if (demoGateFailed) {
      console.error(
        `\nHint: preview demo exit with \`npm run tenant:demo:reset -- --email=${email}\` before retrying.`,
      );
    }
    console.error("\nKitchen NOT ready for closed beta.");
    process.exit(1);
  }
  console.log("\nKitchen ready for closed beta onboarding.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
