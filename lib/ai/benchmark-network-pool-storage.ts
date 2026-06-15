import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import {
  emptyBenchmarkPool,
  upsertContribution,
} from "@/lib/ai/benchmark-network-effects-builders";
import type {
  AnonymizedContribution,
  BenchmarkCohortPool,
} from "@/lib/ai/benchmark-network-effects-types";

const POOL_FILENAME = "benchmark-network-pool.json";

function poolPath(): string {
  return path.join(process.cwd(), "artifacts", POOL_FILENAME);
}

export async function readBenchmarkPool(): Promise<BenchmarkCohortPool> {
  try {
    const raw = await readFile(poolPath(), "utf8");
    const parsed = JSON.parse(raw) as BenchmarkCohortPool;
    if (!parsed.contributions || !Array.isArray(parsed.contributions)) {
      return emptyBenchmarkPool();
    }
    return parsed;
  } catch {
    return emptyBenchmarkPool();
  }
}

export async function writeBenchmarkPool(pool: BenchmarkCohortPool): Promise<void> {
  const dir = path.join(process.cwd(), "artifacts");
  await mkdir(dir, { recursive: true });
  await writeFile(poolPath(), `${JSON.stringify(pool, null, 2)}\n`, "utf8");
}

export async function addToBenchmarkPool(contribution: AnonymizedContribution): Promise<BenchmarkCohortPool> {
  const pool = await readBenchmarkPool();
  const next = upsertContribution(pool, contribution);
  await writeBenchmarkPool(next);
  return next;
}
