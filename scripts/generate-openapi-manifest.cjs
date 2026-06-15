#!/usr/bin/env node
/** Regenerate lib/api/openapi-manifest.json from app/api route handlers (run before prod build). */
const { readdirSync, statSync, writeFileSync } = require("node:fs");
const { join, relative } = require("node:path");

const ROOT = join(__dirname, "..");
const API_ROOT = join(ROOT, "app", "api");
const OUT = join(ROOT, "lib", "api", "openapi-manifest.json");

function collectRouteFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectRouteFiles(full, acc);
    else if (name === "route.ts") acc.push(full);
  }
  return acc;
}

function filePathToApiPath(file) {
  const rel = relative(API_ROOT, file).replace(/\\/g, "/");
  const withoutRoute = rel.replace(/\/route\.ts$/, "");
  const segments = withoutRoute.split("/").map((seg) => {
    if (seg.startsWith("[") && seg.endsWith("]")) {
      const inner = seg.slice(1, -1);
      if (inner.startsWith("...")) return `{${inner.slice(3)}}`;
      return `{${inner}}`;
    }
    return seg;
  });
  return `/api/${segments.join("/")}`;
}

const files = collectRouteFiles(API_ROOT);
const routes = files.map(filePathToApiPath).sort();

writeFileSync(
  OUT,
  JSON.stringify({ routes, generatedAt: new Date().toISOString(), count: routes.length }, null, 2) + "\n",
);
console.log(`✅ OpenAPI manifest: ${routes.length} routes → lib/api/openapi-manifest.json`);
