/**
 * Applies requireTenantActor / dataUserId to dashboard pages.
 * Run: node scripts/migrate-dashboard-tenant-scope.mjs
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "app/dashboard");

function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name === "page.tsx") out.push(p);
  }
  return out;
}

function migrate(content) {
  if (!content.includes("requireSessionUser")) return null;
  if (content.includes("getTenantActor")) return null;

  let s = content;

  if (!s.includes('from "@/lib/scope/cached-tenant"')) {
    s = s.replace(
      /import \{ requireSessionUser \} from "@\/lib\/auth";\n/,
      'import { getTenantActor } from "@/lib/scope/cached-tenant";\n',
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
            return `${imp}import { getTenantActor } from "@/lib/scope/cached-tenant";\n`;
          }
          return m;
        },
      );
    }
  }

  s = s.replace(
    /const user = await requireSessionUser\(\);/g,
    "const { sessionUser: user, dataUserId } = await getTenantActor();",
  );
  s = s.replace(
    /const sessionUser = await requireSessionUser\(\);/g,
    "const { sessionUser, dataUserId } = await getTenantActor();",
  );

  s = s.replace(/userId: user\.id/g, "userId: dataUserId");
  s = s.replace(/userId: sessionUser\.id/g, "userId: dataUserId");

  const dataScopedFns = [
    "ensureCatalogMenu",
    "loadStorefrontMediaAssetsForUser",
    "loadRouteOverviewKpis",
    "listRoutesForUser",
    "loadSalesChannelMetrics",
    "listCustomersForUser",
    "loadCrmOverviewKpis",
    "backfillCustomersFromOrders",
    "getCustomerForUser",
    "listOrdersForCustomer",
  ];
  for (const fn of dataScopedFns) {
    s = s.replace(new RegExp(`${fn}\\(user\\.id\\)`, "g"), `${fn}(dataUserId)`);
    s = s.replace(new RegExp(`${fn}\\(sessionUser\\.id\\)`, "g"), `${fn}(dataUserId)`);
  }

  s = s.replace(/PlanGate userId=\{user\.id\}/g, "PlanGate userId={dataUserId}");
  s = s.replace(/PlanGate userId=\{sessionUser\.id\}/g, "PlanGate userId={dataUserId}");

  if (s === content) return null;
  return s;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = readFileSync(file, "utf8");
  const after = migrate(before);
  if (after) {
    writeFileSync(file, after);
    changed++;
    console.log("migrated", file.replace(process.cwd(), ""));
  }
}
console.log("total migrated", changed);
