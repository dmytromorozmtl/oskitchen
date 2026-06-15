/**
 * Normalize compliance/theme experiment merge helpers to Prisma.JsonValue.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const TARGET_DIRS = [
  path.join(ROOT, "lib/compliance"),
  path.join(ROOT, "lib/storefront"),
];

const PRISMA_IMPORT = 'import type { Prisma } from "@prisma/client";\n';
const JSON_IMPORT = 'import { toJsonValue } from "@/lib/prisma/json";\n';

function ensureImports(src: string): string {
  let out = src;
  if (!out.includes("@/lib/prisma/json")) {
    const firstImport = out.indexOf("import ");
    if (firstImport >= 0) {
      const lineEnd = out.indexOf("\n", firstImport);
      out = out.slice(0, lineEnd + 1) + JSON_IMPORT + out.slice(lineEnd + 1);
    }
  }
  if (out.includes("Prisma.JsonValue") && !out.includes('@prisma/client"')) {
    const firstImport = out.indexOf("import ");
    if (firstImport >= 0) {
      const lineEnd = out.indexOf("\n", firstImport);
      out = out.slice(0, lineEnd + 1) + PRISMA_IMPORT + out.slice(lineEnd + 1);
    }
  }
  return out;
}

function patchContent(src: string): string {
  if (!src.includes("Record<string, unknown>")) return src;

  let out = ensureImports(src);
  out = out.replace(/\): Record<string, unknown>/g, "): Prisma.JsonValue");
  out = out.replace(/\{ json: Record<string, unknown>/g, "{ json: Prisma.JsonValue");
  out = out.replace(/return base;/g, "return toJsonValue(base);");
  out = out.replace(/return merge([^(]+)\(([^)]+)\);/g, "return toJsonValue(merge$1($2));");
  return out;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

let n = 0;
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    const before = fs.readFileSync(file, "utf8");
    const after = patchContent(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      n++;
    }
  }
}
console.log("patched files", n);
