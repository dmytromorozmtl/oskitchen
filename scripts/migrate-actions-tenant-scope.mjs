/**
 * Applies requireTenantActor to server actions.
 * Run: node scripts/migrate-actions-tenant-scope.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "actions");

function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const SKIP = new Set([
  "actions/platform-impersonation.ts",
  "actions/auth.ts",
]);

function migrate(content) {
  if (!content.includes("requireSessionUser")) return null;
  if (content.includes("requireTenantActor")) return null;

  let s = content;

  if (!s.includes('from "@/lib/scope/require-tenant-actor"')) {
    s = s.replace(
      /import \{ requireSessionUser \} from "@\/lib\/auth";\n/,
      'import { requireTenantActor } from "@/lib/scope/require-tenant-actor";\n',
    );
    if (s.includes("requireSessionUser")) {
      s = s.replace(
        /import \{([^}]+)\} from "@\/lib\/auth";/,
        (m, inner) => {
          if (inner.includes("requireSessionUser")) {
            const rest = inner
              .split(",")
              .map((x) => x.trim())
              .filter((x) => x && x !== "requireSessionUser");
            const imp = rest.length ? `import { ${rest.join(", ")} } from "@/lib/auth";\n` : "";
            return `${imp}import { requireTenantActor } from "@/lib/scope/require-tenant-actor";\n`;
          }
          return m;
        },
      );
    }
  }

  s = s.replace(
    /const user = await requireSessionUser\(\);/g,
    "const { sessionUser: user, dataUserId } = await requireTenantActor();",
  );
  s = s.replace(
    /const sessionUser = await requireSessionUser\(\);/g,
    "const { sessionUser, dataUserId } = await requireTenantActor();",
  );

  s = s.replace(/userId: user\.id/g, "userId: dataUserId");
  s = s.replace(/userId: sessionUser\.id/g, "userId: dataUserId");

  s = s.replace(/revalidateProductPaths\(user\.id\)/g, "revalidateProductPaths(dataUserId)");
  s = s.replace(/user\.id\)/g, (match, offset, str) => {
    const before = str.slice(Math.max(0, offset - 40), offset);
    if (before.includes("where: { id:") || before.includes("id: user")) return match;
    return match;
  });

  if (s === content) return null;
  return s;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = file.replace(process.cwd() + "/", "");
  if (SKIP.has(rel)) continue;
  const before = readFileSync(file, "utf8");
  const after = migrate(before);
  if (after) {
    writeFileSync(file, after);
    changed++;
    console.log("migrated", rel);
  }
}
console.log("total migrated", changed);
