/**
 * One-command strict readiness check for a real pilot tenant.
 *
 * Usage:
 *   npm run pilot:readiness -- --email=owner@pilot.com
 *   FINAL_GATE_URL=https://os-kitchen.com npm run pilot:readiness -- --email=owner@pilot.com
 *
 * Runs:
 *  1. DB-backed kitchen preflight
 *  2. Hosted strict smoke against os-kitchen.com (or FINAL_GATE_URL)
 *
 * If demo mode is still on, points to the supervised reset preview path.
 */
import { spawnSync } from "node:child_process";

import { runKitchenPreflight } from "@/services/beta-ops/kitchen-preflight-service";

function parseArg(name: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1]?.trim();
}

async function main() {
  const email = parseArg("email");
  const baseUrl = process.env.FINAL_GATE_URL?.trim() || "https://os-kitchen.com";
  if (!email) {
    console.error("Usage: npm run pilot:readiness -- --email=owner@pilot.com");
    process.exit(1);
  }

  const result = await runKitchenPreflight(email);
  if (!result) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`=== Real pilot readiness: ${email} ===`);
  console.log(`Target URL: ${baseUrl}\n`);

  let blockers = 0;
  for (const gate of result.gates) {
    const prefix = gate.ok ? "OK   " : gate.blocking ? "FAIL " : "WARN ";
    console.log(`${prefix}${gate.label}${gate.detail ? ` — ${gate.detail}` : ""}`);
    if (!gate.ok && gate.blocking) blockers++;
  }

  console.log(
    `\nMetrics: orders=${result.metrics.orderCount} (7d=${result.metrics.ordersLast7d}) staff=${result.metrics.staffMembers} integrations=${result.metrics.integrations}`,
  );

  const strictSmoke = spawnSync("npm", ["run", "smoke:production-tenant:strict"], {
    env: {
      ...process.env,
      SMOKE_PREFLIGHT_EMAIL: email,
      SMOKE_BASE_URL: baseUrl,
    },
    stdio: "inherit",
    shell: process.platform === "win32",
    encoding: "utf8",
  });

  if (strictSmoke.status !== 0) {
    blockers++;
  }

  const demoGateFailed = result.gates.some((g) => g.label === "Demo mode off" && !g.ok);
  if (demoGateFailed) {
    console.log(`\nHint: preview demo exit with \`npm run tenant:demo:reset -- --email=${email}\``);
  }

  console.log("");
  if (blockers > 0) {
    console.error(`Pilot tenant is NOT strict-ready (${blockers} blocking signal set(s)).`);
    console.error(
      `Next: fix blockers, then re-run \`SMOKE_PREFLIGHT_EMAIL=${email} npm run final:100\` after visual/monitoring flags are complete.`,
    );
    process.exit(1);
  }

  console.log("Pilot tenant is strict-ready.");
  console.log(`Next: SMOKE_PREFLIGHT_EMAIL=${email} npm run final:100`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
