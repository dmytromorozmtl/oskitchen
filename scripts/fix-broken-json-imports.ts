import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const dirs = [path.join(ROOT, "lib"), path.join(ROOT, "services")];
let fixed = 0;

for (const dir of dirs) {
  for (const file of walk(dir)) {
    let src = fs.readFileSync(file, "utf8");
    if (!src.includes("import {\nimport { toJsonValue")) continue;

    src = src.replace(
      /import \{\nimport \{ toJsonValue \} from "@\/lib\/prisma\/json";\n/g,
      'import { toJsonValue } from "@/lib/prisma/json";\nimport {\n',
    );
    src = src.replace(
      /import \{\nimport type \{ Prisma \} from "@prisma\/client";\nimport \{ toJsonValue \} from "@\/lib\/prisma\/json";\n/g,
      'import type { Prisma } from "@prisma/client";\nimport { toJsonValue } from "@/lib/prisma/json";\nimport {\n',
    );

    fs.writeFileSync(file, src);
    fixed++;
    console.log("fixed", path.relative(ROOT, file));
  }
}
console.log("done", fixed);
