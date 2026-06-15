/**
 * Generate platform impersonation TOTP secret + otpauth URI (step 3).
 *
 *   npm run setup:impersonation-totp
 *   npm run setup:impersonation-totp -- --issuer=OS Kitchen-Staging
 */
import { authenticator } from "otplib";

function main() {
  const issuer = process.argv.find((a) => a.startsWith("--issuer="))?.split("=")[1] ?? "OS Kitchen-Platform";
  const secret = authenticator.generateSecret();
  const label = `${issuer}:impersonation`;

  const uri = authenticator.keyuri("platform-admin", issuer, secret);
  const sample = authenticator.generate(secret);

  console.log("=== Platform impersonation TOTP setup ===\n");
  console.log("1. Add to Vercel staging (and prod when ready):");
  console.log(`   PLATFORM_IMPERSONATION_TOTP_SECRET=${secret}\n`);
  console.log("2. Scan in authenticator (otpauth URI):");
  console.log(`   ${uri}\n`);
  console.log("3. Verify sample code (rotates every 30s):");
  console.log(`   Current TOTP: ${sample}\n`);
  console.log("4. Test on /platform/users → Impersonate with 6-digit code");
  console.log("\nStore secret in 1Password — never commit to git.");
}

main();
