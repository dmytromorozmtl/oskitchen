/**
 * Wrap remaining sync-service json assignments with toJsonValue.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "services/storefront");

for (const name of fs.readdirSync(DIR)) {
  if (!name.endsWith(".ts")) continue;
  const file = path.join(DIR, name);
  let src = fs.readFileSync(file, "utf8");
  const before = src;

  if (!src.includes("@/lib/prisma/json") && src.includes("themeExperimentJson")) {
    const idx = src.indexOf("\n", src.indexOf("import "));
    src = `${src.slice(0, idx + 1)}import { toJsonValue } from "@/lib/prisma/json";\n${src.slice(idx + 1)}`;
  }

  src = src.replace(/json = fed\.json;/g, "json = toJsonValue(fed.json);");
  src = src.replace(/json = merged;/g, "json = toJsonValue(merged);");
  src = src.replace(
    /json = (merge[A-Za-z0-9_]+)\(json,/g,
    "json = toJsonValue($1(json,",
  );
  src = src.replace(
    /json = ([a-zA-Z0-9_]+)\(([^)]+)\)\.json;/g,
    "json = toJsonValue($1($2).json);",
  );

  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log("patched", name);
  }
}
