import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type SkippedTestInventoryHit = {
  file: string;
  line: number;
  pattern: "describe.skipIf" | "describe.skip" | "it.skip" | "test.skip" | "it.skipIf" | "test.skipIf";
  snippet: string;
};

const SKIP_PATTERNS: Array<{ pattern: SkippedTestInventoryHit["pattern"]; re: RegExp }> = [
  { pattern: "describe.skipIf", re: /\bdescribe\.skipIf\s*\(/ },
  { pattern: "describe.skip", re: /\bdescribe\.skip\s*\(/ },
  { pattern: "it.skipIf", re: /\bit\.skipIf\s*\(/ },
  { pattern: "test.skipIf", re: /\btest\.skipIf\s*\(/ },
  { pattern: "it.skip", re: /\bit\.skip\s*\(/ },
  { pattern: "test.skip", re: /\btest\.skip\s*\(/ },
];

const SCAN_ROOTS = ["tests", "e2e"] as const;

function walkTsFiles(dir: string, root: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".auth") continue;
      walkTsFiles(abs, root, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry)) {
      out.push(relative(root, abs));
    }
  }
}

export function scanSkippedTestPatterns(root = process.cwd()): SkippedTestInventoryHit[] {
  const hits: SkippedTestInventoryHit[] = [];

  for (const scanRoot of SCAN_ROOTS) {
    const absRoot = join(root, scanRoot);
    const files: string[] = [];
    try {
      walkTsFiles(absRoot, root, files);
    } catch {
      continue;
    }

    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      const lines = source.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? "";
        for (const { pattern, re } of SKIP_PATTERNS) {
          if (re.test(line)) {
            hits.push({
              file,
              line: i + 1,
              pattern,
              snippet: line.trim().slice(0, 120),
            });
          }
        }
      }
    }
  }

  return hits;
}

export function countSkippedTestInventoryHits(root = process.cwd()): number {
  return scanSkippedTestPatterns(root).length;
}
