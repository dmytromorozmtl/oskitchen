/**
 * Record paid-pilot sign-off (Tech / Ops / Product).
 *
 *   npm run pilot:record-signoff -- --role=tech --by="Tech Lead" --go
 *   npm run pilot:record-signoff -- --role=ops --by="Ops" --go
 *   npm run pilot:record-signoff -- --role=product --by="Product" --go --notes="Golden path 18 May"
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Role = "tech" | "ops" | "product";
type SignoffFile = {
  updatedAt: string;
  verdict: "GO" | "NO-GO" | "PENDING";
  roles: Partial<
    Record<
      Role,
      { by: string; at: string; go: boolean; notes?: string }
    >
  >;
};

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=").trim();
}

function main() {
  const role = arg("role") as Role | undefined;
  const by = arg("by");
  const go = process.argv.includes("--go");
  const noGo = process.argv.includes("--no-go");
  const notes = arg("notes");

  if (!role || !by || (!go && !noGo)) {
    console.error(
      'Usage: npm run pilot:record-signoff -- --role=tech|ops|product --by="Name" --go [--notes="..."]',
    );
    process.exit(1);
  }
  if (!["tech", "ops", "product"].includes(role)) {
    console.error("role must be tech, ops, or product");
    process.exit(1);
  }

  const dir = join(process.cwd(), "docs/artifacts");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "PILOT_SIGNOFF.json");

  let data: SignoffFile = {
    updatedAt: new Date().toISOString(),
    verdict: "PENDING",
    roles: {},
  };
  if (existsSync(path)) {
    data = JSON.parse(readFileSync(path, "utf8")) as SignoffFile;
  }

  data.roles[role] = {
    by,
    at: new Date().toISOString(),
    go,
    ...(notes ? { notes } : {}),
  };
  data.updatedAt = new Date().toISOString();

  const allGo =
    data.roles.tech?.go && data.roles.ops?.go && data.roles.product?.go;
  const anyNo = [data.roles.tech, data.roles.ops, data.roles.product].some((r) => r && !r.go);
  data.verdict = allGo ? "GO" : anyNo ? "NO-GO" : "PENDING";

  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
  console.log(`Recorded ${role} sign-off → ${path}`);
  console.log(`Verdict: ${data.verdict}`);
  if (data.verdict === "GO") {
    console.log("All three roles signed GO — paid pilot cleared.");
  } else {
    const pending = (["tech", "ops", "product"] as Role[]).filter((r) => !data.roles[r]?.go);
    console.log(`Pending: ${pending.join(", ") || "none"} (need --go from each role)`);
  }
}

main();
