/**
 * One-off patch: theme experiment sync services assign poll().json into JsonValue.
 * Run: npx tsx scripts/patch-theme-experiment-sync-json.ts
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(ROOT, "services/storefront");

const IMPORT =
  'import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";\n';

function patchFile(filePath: string): boolean {
  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes("let json = sf.themeExperimentJson")) {
    return false;
  }

  if (!src.includes("@/lib/prisma/json")) {
    const lines = src.split("\n");
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith("import ")) insertAt = i + 1;
      else if (insertAt > 0 && lines[i]?.trim() === "") break;
    }
    lines.splice(insertAt, 0, IMPORT.trim());
    src = lines.join("\n");
  }

  src = src.replace(
    /let json = sf\.themeExperimentJson;/g,
    "let json = coalesceThemeExperimentJson(sf.themeExperimentJson);",
  );

  src = src.replace(/json = ([a-zA-Z0-9_]+)\(json\)\.json;/g, "json = applyThemeExperimentPoll(json, $1);");

  src = src.replace(
    /const \{ json: merged \} = ([a-zA-Z0-9_]+)\(json\);/g,
    "const merged = applyThemeExperimentPoll(json, $1);",
  );

  src = src.replace(
    /themeExperimentJson: merged as object/g,
    "themeExperimentJson: toInputJsonValue(merged)",
  );
  src = src.replace(
    /themeExperimentJson: json as object/g,
    "themeExperimentJson: toInputJsonValue(json)",
  );

  fs.writeFileSync(filePath, src);
  return true;
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".ts"));
let patched = 0;
for (const f of files) {
  if (patchFile(path.join(DIR, f))) {
    patched++;
    console.log("patched", f);
  }
}
console.log("done", patched);
