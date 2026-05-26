import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const repoRoot = process.cwd();
const allowedFiles = new Set([
  "prisma/seed.ts",
  "services/orders/order-creation-service.ts",
  "services/demo-data.ts",
  "services/demo/commercial-demo-seed.ts",
  "scripts/validate-order-write-paths.ts",
  "tests/integration/tenant-isolation.test.ts",
]);

function walk(dir: string, output: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") {
      continue;
    }
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, output);
      continue;
    }
    if (stats.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))) {
      output.push(fullPath);
    }
  }
  return output;
}

const offenders: string[] = [];
const directOrderWritePattern = /\b[a-zA-Z_$][\w$]*\.order\.(create|upsert)\(/;

for (const absolutePath of walk(repoRoot)) {
  const relativePath = relative(repoRoot, absolutePath).split(sep).join("/");
  if (allowedFiles.has(relativePath)) {
    continue;
  }
  const contents = readFileSync(absolutePath, "utf8");
  if (directOrderWritePattern.test(contents)) {
    offenders.push(relativePath);
  }
}

if (offenders.length > 0) {
  console.error(
    [
      "Direct *.order.create() / *.order.upsert() usage is only allowed in the canonical order service.",
      "Move application order writes into services/orders/order-creation-service.ts.",
      "",
      ...offenders.map((file) => `- ${file}`),
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Order write-path validation passed.");
