import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const IMPORT_RE = /@\/lib\/prisma\/json/;
const NEEDS_RE = /\b(ThemeExperimentJson|toJsonValue|coalesceThemeExperimentJson|applyThemeExperimentPoll|toInputJsonValue|foldThemeExperimentJson)\b/;

let n = 0;
for (const file of walk(ROOT)) {
  if (file.includes("node_modules") || file.includes("scripts/") || file.includes("lib/prisma/json.ts")) continue;
  const src = fs.readFileSync(file, "utf8");
  if (!NEEDS_RE.test(src) || IMPORT_RE.test(src)) continue;

  const needsTheme = /\bThemeExperimentJson\b/.test(src);
  const needsToJson = /\btoJsonValue\b/.test(src);
  const needsCoalesce = /\bcoalesceThemeExperimentJson\b/.test(src);
  const needsApply = /\bapplyThemeExperimentPoll\b/.test(src);
  const needsInput = /\btoInputJsonValue\b/.test(src);
  const needsFold = /\bfoldThemeExperimentJson\b/.test(src);

  const parts: string[] = [];
  if (needsToJson || needsCoalesce || needsApply || needsInput || needsFold) parts.push("toJsonValue");
  if (needsCoalesce) parts[0] = "coalesceThemeExperimentJson, toJsonValue".replace(/toJsonValue, toJsonValue/, "toJsonValue");
  // rebuild properly
  const named: string[] = [];
  if (needsCoalesce) named.push("coalesceThemeExperimentJson");
  if (needsApply) named.push("applyThemeExperimentPoll");
  if (needsInput) named.push("toInputJsonValue");
  if (needsFold) named.push("foldThemeExperimentJson");
  if (needsToJson) named.push("toJsonValue");
  if (needsTheme) named.push("type ThemeExperimentJson");

  const importLine = `import { ${named.join(", ")} } from "@/lib/prisma/json";\n`;
  const firstImport = src.indexOf("import ");
  const lineEnd = firstImport >= 0 ? src.indexOf("\n", firstImport) : 0;
  const out = firstImport >= 0 ? src.slice(0, lineEnd + 1) + importLine + src.slice(lineEnd + 1) : importLine + src;
  fs.writeFileSync(file, out);
  n++;
}
console.log("added imports to", n);
