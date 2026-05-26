import { readFileSync } from "node:fs";
import { join } from "node:path";

type ClaimStatus = "verified" | "illustrative" | "needs-evidence" | "deprecated";

type ClaimRow = {
  claim: string;
  page: string;
  evidenceType: string;
  evidenceSource: string;
  dateVerified: string;
  status: ClaimStatus;
};

const ROOT = process.cwd();
const REGISTRY_PATH = join(ROOT, "config", "marketing", "claims-registry.json");

function main(): void {
  const rows = JSON.parse(readFileSync(REGISTRY_PATH, "utf8")) as ClaimRow[];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const prefix = `claims-registry[${index}]`;
    if (!row.claim?.trim()) errors.push(`${prefix}: missing claim`);
    if (!row.page?.trim()) errors.push(`${prefix}: missing page`);
    if (!row.evidenceType?.trim()) errors.push(`${prefix}: missing evidenceType`);
    if (!row.evidenceSource?.trim()) errors.push(`${prefix}: missing evidenceSource`);
    if (!row.dateVerified?.trim()) errors.push(`${prefix}: missing dateVerified`);
    if (!["verified", "illustrative", "needs-evidence", "deprecated"].includes(row.status)) {
      errors.push(`${prefix}: invalid status ${row.status}`);
    }
  });

  console.log("KitchenOS marketing claims audit\n");
  console.log(`Claims tracked: ${rows.length}`);
  console.log(`Verified: ${rows.filter((row) => row.status === "verified").length}`);
  console.log(`Illustrative: ${rows.filter((row) => row.status === "illustrative").length}`);
  console.log(`Needs evidence: ${rows.filter((row) => row.status === "needs-evidence").length}`);
  console.log(`Deprecated: ${rows.filter((row) => row.status === "deprecated").length}`);

  if (errors.length > 0) {
    console.error("\nRegistry errors:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const risky = rows.filter((row) => row.status === "needs-evidence" || row.status === "deprecated");
  if (risky.length > 0) {
    console.warn("\nHigh-risk claim rows:");
    for (const row of risky) {
      console.warn(`- [${row.status}] ${row.page} :: ${row.claim}`);
    }
  } else {
    console.log("\nOK — no high-risk claim rows.");
  }
}

main();
