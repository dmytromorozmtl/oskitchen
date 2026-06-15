/**
 * One-off: migrate cron routes to `runCronRoute` + experimental gate where applicable.
 * Run: npx tsx scripts/patch-cron-routes-auth.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CRON_ROOT = join(process.cwd(), "app/api/cron");

const EXPERIMENTAL_PREFIXES = [
  "hypergraph-",
  "multiverse-",
  "omniverse-",
  "metaverse-",
  "eu-ai-",
  "recursive-zk",
  "zk-dna",
  "pqc-dna",
  "cerebellar-",
  "prefrontal-",
  "cosmic-web",
  "galactic-",
  "intergalactic-",
  "iso-42001",
  "iso-iec",
  "nist-ai",
  "oecd-",
  "uk-dsit",
  "us-ftc",
  "wto-",
  "icao-",
  "itu-",
  "cen-cenelec",
  "five-eyes",
  "soci-nz",
  "pspf-nz",
  "ismap-",
  "arctic-",
  "antarctic-",
  "lunar-",
  "martian-",
  "jupiter-",
  "saturn-",
  "uranus-",
  "neptune-",
  "pluto-",
  "kuiper-",
  "heliopause-",
  "homomorphic-",
  "indo-pacific",
  "pan-pacific",
  "brainstem-",
  "cerebellum-",
  "motor-cortex-",
  "basal-ganglia-",
  "thalamus-",
  "midbrain-",
  "medulla-",
  "pons-",
  "spinal-cord-",
  "premotor-",
  "hippocampal-",
  "cortical-",
];

function isExperimental(routeDir: string): boolean {
  const name = routeDir.replace(/\/route\.ts$/, "").split("/").pop() ?? "";
  return EXPERIMENTAL_PREFIXES.some((p) => name.startsWith(p));
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (ent === "route.ts") out.push(p);
  }
  return out;
}

for (const file of walk(CRON_ROOT)) {
  let src = readFileSync(file, "utf8");
  if (src.includes("runCronRoute")) continue;

  const experimental = isExperimental(file);
  const importLine = `import { runCronRoute } from "@/lib/api/run-cron";\n`;

  if (!src.includes('from "@/lib/api/run-cron"')) {
    const firstImport = src.indexOf("import ");
    src = src.slice(0, firstImport) + importLine + src.slice(firstImport);
  }

  const authBlock =
    /async function handleCron\(request: Request\) \{\s*const secret = process\.env\.CRON_SECRET;[\s\S]*?if \(auth !== `Bearer \$\{secret\}`\) \{[\s\S]*?return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\s*\}\s*/;

  if (!authBlock.test(src)) continue;

  const handlerBody = src.replace(authBlock, "async function handleCron(request: Request) {\n  ");
  const wrapped = handlerBody.replace(
    /async function handleCron\(request: Request\) \{/,
    `async function handleCron(request: Request) {\n  return runCronRoute(request, async () => {`,
  );

  let final = wrapped.replace(
    /export async function (GET|POST)\(request: Request\) \{\s*return handleCron\(request\);\s*\}/g,
    (m, method) =>
      `export async function ${method}(request: Request) {\n  return handleCron(request);\n}`,
  );

  if (!final.includes("}, { experimental:") && experimental) {
    final = final.replace(
      /return runCronRoute\(request, async \(\) => \{/,
      "return runCronRoute(request, async () => {",
    );
    const closeIdx = final.lastIndexOf("\n}");
    if (closeIdx > 0) {
      final =
        final.slice(0, closeIdx) +
        "\n  }, { experimental: true });\n}" +
        final.slice(closeIdx + 2);
    }
  } else if (!final.includes("});")) {
    final = final.replace(/\n\}\s*\nexport async function GET/, "\n  });\n}\n\nexport async function GET");
  }

  writeFileSync(file, final);
  console.log("patched", file.replace(process.cwd(), ""));
}

console.log("done");
