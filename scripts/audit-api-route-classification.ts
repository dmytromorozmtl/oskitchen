import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

type RouteClass =
  | "public"
  | "webhook"
  | "cron"
  | "session"
  | "platform"
  | "storefront"
  | "health"
  | "internal"
  | "invite";

type Config = {
  exactRoutes: Record<string, RouteClass>;
  topLevelPrefixes: Record<string, RouteClass>;
  strictExactRoutes?: Record<string, RouteClass>;
  strictTopLevelPrefixes?: Record<string, RouteClass>;
  approvedGuardHelpers: Record<string, RouteClass>;
};

const ROOT = process.cwd();
const API_ROOT = join(ROOT, "app", "api");
const CONFIG_PATH = join(ROOT, "config", "security", "api-route-classification.json");
const CLASS_RE = /@auth-classification\s+(public|webhook|cron|session|platform|storefront|health|internal|invite)\b/;

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as Config;

function walk(dir: string, output: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full, output);
      continue;
    }
    if (stats.isFile() && entry === "route.ts") {
      output.push(full);
    }
  }
  return output;
}

function routePathFromFile(filePath: string): string {
  const rel = relative(API_ROOT, filePath).split(sep).join("/");
  const pathWithoutLeaf = rel.replace(/\/route\.ts$/, "");
  return `/api/${pathWithoutLeaf}`.replace(/\/+$/, "");
}

function classFromConfig(routePath: string): RouteClass | null {
  if (config.exactRoutes[routePath]) return config.exactRoutes[routePath];

  const parts = routePath.split("/").filter(Boolean);
  const topLevel = parts[1];
  if (!topLevel) return null;
  return config.topLevelPrefixes[topLevel] ?? null;
}

function classFromStrictConfig(routePath: string): RouteClass | null {
  if (config.strictExactRoutes?.[routePath]) return config.strictExactRoutes[routePath];

  const parts = routePath.split("/").filter(Boolean);
  const topLevel = parts[1];
  if (!topLevel) return null;
  return config.strictTopLevelPrefixes?.[topLevel] ?? null;
}

function classFromComment(contents: string): RouteClass | null {
  const match = contents.match(CLASS_RE);
  return (match?.[1] as RouteClass | undefined) ?? null;
}

function classFromApprovedGuard(contents: string): RouteClass | null {
  for (const [helper, routeClass] of Object.entries(config.approvedGuardHelpers)) {
    const helperRe = new RegExp(`\\b${helper}\\s*\\(`);
    if (helperRe.test(contents)) return routeClass;
  }
  return null;
}

type Classification = {
  file: string;
  routePath: string;
  routeClass: RouteClass | null;
  source: "comment" | "guard_helper" | "config" | "strict_config_missing_proof" | "missing";
};

function classify(filePath: string): Classification {
  const routePath = routePathFromFile(filePath);
  const contents = readFileSync(filePath, "utf8");
  const fromComment = classFromComment(contents);
  if (fromComment) {
    return {
      file: relative(ROOT, filePath).split(sep).join("/"),
      routePath,
      routeClass: fromComment,
      source: "comment",
    };
  }

  const fromGuard = classFromApprovedGuard(contents);
  if (fromGuard) {
    return {
      file: relative(ROOT, filePath).split(sep).join("/"),
      routePath,
      routeClass: fromGuard,
      source: "guard_helper",
    };
  }

  const fromStrictConfig = classFromStrictConfig(routePath);
  if (fromStrictConfig) {
    return {
      file: relative(ROOT, filePath).split(sep).join("/"),
      routePath,
      routeClass: fromStrictConfig,
      source: "strict_config_missing_proof",
    };
  }

  const fromConfig = classFromConfig(routePath);
  if (fromConfig) {
    return {
      file: relative(ROOT, filePath).split(sep).join("/"),
      routePath,
      routeClass: fromConfig,
      source: "config",
    };
  }

  return {
    file: relative(ROOT, filePath).split(sep).join("/"),
    routePath,
    routeClass: null,
    source: "missing",
  };
}

function main(): void {
  const results = walk(API_ROOT).map(classify).sort((a, b) => a.routePath.localeCompare(b.routePath));
  const missing = results.filter(
    (result) => result.source === "missing" || result.source === "strict_config_missing_proof",
  );

  console.log("OS Kitchen API route classification audit\n");
  console.log(`Total routes: ${results.length}`);
  console.log(`Classified: ${results.length - missing.length}`);
  console.log(`Unclassified: ${missing.length}\n`);

  const counts = new Map<RouteClass, number>();
  for (const result of results) {
    if (!result.routeClass) continue;
    counts.set(result.routeClass, (counts.get(result.routeClass) ?? 0) + 1);
  }
  for (const routeClass of [...counts.keys()].sort()) {
    console.log(`  ${routeClass.padEnd(10)} ${counts.get(routeClass)}`);
  }

  if (missing.length === 0) {
    console.log("\nOK — all API routes are classified.");
    return;
  }

  console.error("\nUnclassified API routes:");
  for (const result of missing) {
    const hint =
      result.source === "strict_config_missing_proof"
        ? "requires file-local guard proof"
        : "missing classification";
    console.error(`- ${result.routePath} (${result.file}) — ${hint}`);
  }
  console.error(
    "\nAdd @auth-classification, use an approved guard helper, or extend config/security/api-route-classification.json. Strict routes cannot rely on top-level config alone.",
  );
  process.exit(1);
}

main();
