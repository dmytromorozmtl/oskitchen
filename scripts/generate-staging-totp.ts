/**
 * Generate PLATFORM_IMPERSONATION_TOTP_SECRET → .env.staging.local
 *
 *   npm run staging:totp:generate
 */
import { authenticator } from "otplib";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { patchEnvFile } from "./lib/patch-env-file";

const ROOT = process.cwd();
const TARGET = join(ROOT, ".env.staging.local");
const EXAMPLE = join(ROOT, ".env.staging.example");

function main() {
  if (!existsSync(TARGET)) {
    copyFileSync(EXAMPLE, TARGET);
    console.log(`Created ${TARGET}`);
  }

  const issuer =
    process.argv.find((a) => a.startsWith("--issuer="))?.split("=")[1] ??
    "KitchenOS-Staging";
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri("platform-admin", issuer, secret);

  patchEnvFile(TARGET, "PLATFORM_IMPERSONATION_TOTP_SECRET", secret);

  console.log("=== Staging TOTP generated ===\n");
  console.log("Written to .env.staging.local: PLATFORM_IMPERSONATION_TOTP_SECRET");
  console.log("\nScan in Google Authenticator / 1Password:");
  console.log(uri);
  console.log("\nSample code (rotates):", authenticator.generate(secret));
  console.log("\nAlso add to Vercel staging, then: npm run verify:staging-env");
}

main();
