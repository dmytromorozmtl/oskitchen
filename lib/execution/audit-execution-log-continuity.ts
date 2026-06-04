import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  EXECUTION_LOG_ARTIFACT,
  EXECUTION_LOG_CYCLE_REQUIRED_FIELDS,
  EXECUTION_LOG_HEADER_MARKER,
  EXECUTION_LOG_MIN_LAST_CYCLE,
} from "@/lib/execution/execution-log-policy";

export type ExecutionLogCycleBlock = {
  cycle: number;
  hasModernFields: boolean;
  taskLine?: string;
};

export function parseExecutionLogCycleNumbers(content: string): number[] {
  const cycles: number[] = [];
  for (const match of content.matchAll(/^Cycle:\s*(\d+)\s*$/gm)) {
    cycles.push(Number(match[1]));
  }
  return cycles;
}

export function parseExecutionLogBlocks(content: string): ExecutionLogCycleBlock[] {
  const parts = content.split(/\n---\n/);
  const blocks: ExecutionLogCycleBlock[] = [];

  for (const part of parts) {
    const cycleMatch = part.match(/^Cycle:\s*(\d+)/m);
    if (!cycleMatch) continue;
    const cycle = Number(cycleMatch[1]);
    const hasModernFields = EXECUTION_LOG_CYCLE_REQUIRED_FIELDS.every((field) =>
      part.includes(field),
    );
    const taskMatch = part.match(/^Task:\s*(.+)$/m);
    blocks.push({
      cycle,
      hasModernFields,
      taskLine: taskMatch?.[1]?.trim(),
    });
  }

  return blocks;
}

export type ExecutionLogContinuityAudit = {
  logPresent: boolean;
  headerMarkerPresent: boolean;
  totalCycles: number;
  lastCycle: number;
  modernCycleCount: number;
  hasCycle211: boolean;
  hasCycle212: boolean;
  hasCycle213: boolean;
  continuityHonest: boolean;
};

export function auditExecutionLogContinuity(root = process.cwd()): ExecutionLogContinuityAudit {
  const path = join(root, EXECUTION_LOG_ARTIFACT);
  if (!existsSync(path)) {
    return {
      logPresent: false,
      headerMarkerPresent: false,
      totalCycles: 0,
      lastCycle: 0,
      modernCycleCount: 0,
      hasCycle211: false,
      hasCycle212: false,
      hasCycle213: false,
      continuityHonest: false,
    };
  }

  const content = readFileSync(path, "utf8");
  const cycleNumbers = parseExecutionLogCycleNumbers(content);
  const blocks = parseExecutionLogBlocks(content);
  const lastCycle = cycleNumbers.length ? Math.max(...cycleNumbers) : 0;
  const modernCycleCount = blocks.filter((b) => b.hasModernFields).length;

  const hasCycle = (n: number) => cycleNumbers.includes(n);

  const continuityHonest =
    lastCycle >= EXECUTION_LOG_MIN_LAST_CYCLE &&
    hasCycle(211) &&
    hasCycle(212) &&
    hasCycle(213) &&
    modernCycleCount >= 50;

  return {
    logPresent: true,
    headerMarkerPresent: content.includes(EXECUTION_LOG_HEADER_MARKER),
    totalCycles: cycleNumbers.length,
    lastCycle,
    modernCycleCount,
    hasCycle211: hasCycle(211),
    hasCycle212: hasCycle(212),
    hasCycle213: hasCycle(213),
    continuityHonest,
  };
}

export function ensureExecutionLogHeader(content: string): string {
  if (content.includes(EXECUTION_LOG_HEADER_MARKER)) {
    return content;
  }
  const trimmed = content.replace(/^\n+/, "");
  return `${EXECUTION_LOG_HEADER_MARKER}\n\n${trimmed}`;
}
