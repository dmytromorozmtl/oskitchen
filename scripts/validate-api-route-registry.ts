import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { getApiRoutePolicy } from "@/lib/api/route-registry";

const repoRoot = process.cwd();
const apiRoot = join(repoRoot, "app", "api");

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
    if (stats.isFile() && entry === "route.ts") {
      output.push(fullPath);
    }
  }
  return output;
}

function routePathFromFile(filePath: string): string {
  const rel = relative(apiRoot, filePath).split(sep).join("/");
  const pathWithoutLeaf = rel.replace(/\/route\.ts$/, "");
  return `/api/${pathWithoutLeaf}`.replace(/\/+$/, "");
}

const uncovered: string[] = [];

for (const filePath of walk(apiRoot)) {
  const routePath = routePathFromFile(filePath);
  const policy = getApiRoutePolicy(routePath);
  if (!policy) {
    uncovered.push(routePath);
  }
}

if (uncovered.length > 0) {
  console.error(
    [
      "API route registry is missing coverage for the following routes:",
      ...uncovered.map((route) => `- ${route}`),
    ].join("\n"),
  );
  process.exit(1);
}

console.log("API route registry validation passed.");
