/**
 * Non-blocking marketing vs capability-matrix consistency check.
 * Run: npm run verify-claims
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const ROADMAP_TERMS = [
  { id: "uber_eats", patterns: [/uber\s*eats/i, /live\s+uber/i] },
  { id: "uber_direct", patterns: [/uber\s*direct/i, /live\s+courier/i] },
  { id: "doordash", patterns: [/doordash/i] },
  { id: "stripe_terminal", patterns: [/stripe\s*terminal/i] },
  { id: "sms", patterns: [/\bsms\b/i, /text\s+message/i] },
];

const SAFE_QUALIFIERS = /beta|roadmap|coming soon|partner|not available|requires|placeholder|evaluation/i;

function readMarketingSources(): string[] {
  const paths: string[] = [];
  const dirs = ["components/marketing", "components/landing", "app/integrations", "lib/public-copy.ts"];
  for (const rel of dirs) {
    const full = join(ROOT, rel);
    try {
      const stat = statSync(full);
      if (stat.isFile()) {
        paths.push(full);
        continue;
      }
      for (const f of readdirSync(full, { withFileTypes: true })) {
        if (f.isFile() && /\.(tsx?|md)$/.test(f.name)) {
          paths.push(join(full, f.name));
        }
      }
    } catch {
      /* skip */
    }
  }
  return paths.map((p) => readFileSync(p, "utf8"));
}

function main() {
  const sources = readMarketingSources();
  const combined = sources.join("\n");
  let warnings = 0;

  console.log("Marketing claim check (non-blocking)\n");

  for (const term of ROADMAP_TERMS) {
    for (const pattern of term.patterns) {
      const matches = combined.match(new RegExp(pattern.source, "gi"));
      if (!matches?.length) continue;
      const hasUnsafe = matches.some((m) => {
        const idx = combined.indexOf(m);
        const context = combined.slice(Math.max(0, idx - 80), idx + m.length + 80);
        return !SAFE_QUALIFIERS.test(context);
      });
      if (hasUnsafe) {
        console.warn(`⚠  Possible overclaim for "${term.id}" — verify context includes beta/roadmap qualifier`);
        warnings++;
      }
    }
  }

  if (warnings === 0) {
    console.log("✓ No obvious unqualified roadmap-term hits in scanned marketing files");
  } else {
    console.log(`\n${warnings} warning(s). Cross-check lib/capabilities/capability-matrix.ts`);
  }

  process.exitCode = 0;
}

main();
