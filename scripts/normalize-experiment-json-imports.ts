import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TARGET_DIRS = [path.join(ROOT, "lib/compliance"), path.join(ROOT, "lib/storefront"), path.join(ROOT, "services/storefront")];

const JSON_IMPORT_LINE = 'import { toJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";\n';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

function ensureJsonImport(src: string): string {
  if (src.includes('@/lib/prisma/json"')) {
    if (!src.includes("ThemeExperimentJson") && src.includes("Prisma.JsonValue")) {
      return src.replace(
        /import \{([^}]+)\} from "@\/lib\/prisma\/json";/,
        (_, inner: string) => {
          const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);
          if (!parts.some((p) => p.includes("ThemeExperimentJson"))) {
            parts.push("type ThemeExperimentJson");
          }
          return `import { ${parts.join(", ")} } from "@/lib/prisma/json";`;
        },
      );
    }
    return src;
  }
  const firstImport = src.indexOf("import ");
  if (firstImport < 0) return JSON_IMPORT_LINE + src;
  const lineEnd = src.indexOf("\n", firstImport);
  return src.slice(0, lineEnd + 1) + JSON_IMPORT_LINE + src.slice(lineEnd + 1);
}

let n = 0;
for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    let src = fs.readFileSync(file, "utf8");
    const before = src;
    if (!src.includes("Prisma.JsonValue") && !src.includes("toJsonValue") && !src.includes("ThemeExperimentJson")) {
      continue;
    }
    src = src.replace(/\bPrisma\.JsonValue\b/g, "ThemeExperimentJson");
    src = src.replace(
      /^import type \{ Prisma \} from "@prisma\/client";\n/gm,
      "",
    );
    src = ensureJsonImport(src);
    if (src !== before) {
      fs.writeFileSync(file, src);
      n++;
    }
  }
}
console.log("normalized", n);
