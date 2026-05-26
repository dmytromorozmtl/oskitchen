/**
 * Migrate cron routes that still use inline CRON_SECRET checks (variant with `auth` variable).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";

const CRON_ROOT = join(process.cwd(), "app/api/cron");

const EXP = [
  "hypergraph-", "multiverse-", "omniverse-", "metaverse-", "eu-ai-", "zk-dna", "recursive-zk",
  "pqc-dna", "cerebellar", "prefrontal", "cosmic-web", "iso-42001", "nist-ai", "brainstem",
  "homomorphic", "pan-pacific", "indo-pacific", "galactic-", "intergalactic-", "lunar-", "martian-",
  "jupiter-", "saturn-", "uranus-", "neptune-", "pluto-", "kuiper-", "heliopause-", "arctic-",
  "antarctic-", "oecd-", "uk-dsit", "us-ftc", "wto-", "icao-", "itu-", "five-eyes", "pons-",
  "spinal-cord-", "motor-cortex-", "basal-ganglia-", "thalamus-", "midbrain-", "medulla-",
  "premotor-", "hippocampal-", "cortical-", "parallel-universe", "cen-cenelec", "iso-iec",
  "storefront-experiment-", "experiment-", "soc2-", "iso27001", "pci-dss", "hipaa-", "fedramp-",
  "cmmc-", "irap-", "ismap-", "pspf-", "soci-", "stateramp-", "uk-ai", "eu-ai", "eo-14110",
];

function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name === "route.ts") out.push(p);
  }
  return out;
}

const blockA =
  /async function handleCron\(request: Request\) \{\s*const secret = process\.env\.CRON_SECRET;\s*if \(!secret\) \{[\s\S]*?return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\s*\}\s*/;

const blockB =
  /async function handleCron\(request: Request\) \{\s*const secret = process\.env\.CRON_SECRET;\s*if \(!secret\) \{[\s\S]*?if \(auth !== `Bearer \$\{secret\}`\) \{[\s\S]*?return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\s*\}\s*/;

let patched = 0;
for (const file of walk(CRON_ROOT)) {
  let s = readFileSync(file, "utf8");
  if (s.includes("runCronRoute")) continue;
  const block = blockA.test(s) ? blockA : blockB.test(s) ? blockB : null;
  if (!block) continue;

  const name = basename(dirname(file));
  const experimental = EXP.some((p) => name.startsWith(p));

  if (!s.includes("@/lib/api/run-cron")) {
    s = s.replace(
      'import { NextResponse } from "next/server";',
      'import { NextResponse } from "next/server";\n\nimport { runCronRoute } from "@/lib/api/run-cron";',
    );
  }

  s = s.replace(
    block,
    "async function handleCron(request: Request) {\n  return runCronRoute(request, async () => {\n",
  );

  const marker = "\nexport async function GET";
  const idx = s.indexOf(marker);
  if (idx === -1) continue;
  const head = s.slice(0, idx).trimEnd();
  if (!head.endsWith("});") && !head.endsWith("}, { experimental: true });")) {
    s = head + (experimental ? "\n  }, { experimental: true });\n}\n" : "\n  });\n}\n") + s.slice(idx);
  }

  writeFileSync(file, s);
  patched++;
  console.log("patched", file.replace(process.cwd(), ""));
}
console.log("total", patched);
