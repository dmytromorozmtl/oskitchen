/**
 * Record Product sign-off for step 5 (staff visibility).
 *
 *   npm run beta:record-product-signoff -- --by="Product Lead" --owner-email=owner@pilot.com
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=").trim();
}

function main() {
  const by = arg("by");
  const ownerEmail = arg("owner-email") ?? "";
  if (!by) {
    console.error('Usage: npm run beta:record-product-signoff -- --by="Name" [--owner-email=...]');
    process.exit(1);
  }

  const payload = {
    approved: true,
    approvedBy: by,
    approvedAt: new Date().toISOString(),
    ownerEmail: ownerEmail || null,
    checklist: "docs/MANUAL_STAFF_VISIBILITY_CHECKLIST.md",
    automatedChecks: ["verify:staff-scope", "verify:staff-parity"],
  };

  const dir = join(process.cwd(), "docs", "artifacts");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "PRODUCT_SIGNOFF.json");
  writeFileSync(path, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Recorded product sign-off → ${path}`);
}

main();
