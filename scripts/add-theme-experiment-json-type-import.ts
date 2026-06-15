import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

let n = 0;
for (const file of walk(ROOT)) {
  if (file.includes("node_modules") || file.endsWith("lib/prisma/json.ts")) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("ThemeExperimentJson")) continue;
  if (src.includes("type ThemeExperimentJson")) continue;

  if (src.includes('@/lib/prisma/json"')) {
    src = src.replace(
      /import \{([^}]+)\} from "@\/lib\/prisma\/json";/,
      (_, inner: string) => {
        const trimmed = inner.trim();
        return `import { ${trimmed}, type ThemeExperimentJson } from "@/lib/prisma/json";`;
      },
    );
  } else {
    const firstImport = src.indexOf("import ");
    const lineEnd = src.indexOf("\n", firstImport);
    src =
      src.slice(0, lineEnd + 1) +
      'import { type ThemeExperimentJson } from "@/lib/prisma/json";\n' +
      src.slice(lineEnd + 1);
  }
  fs.writeFileSync(file, src);
  n++;
}
console.log("updated", n);
