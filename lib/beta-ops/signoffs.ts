import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ARTIFACT_DIR = join(process.cwd(), "docs", "artifacts");

export type SignoffRecord = {
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  ticket?: string;
};

export function readDbaSignoff(path = join(ARTIFACT_DIR, "DBA_SIGNOFF.json")): SignoffRecord | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as SignoffRecord;
    return parsed.approved ? parsed : null;
  } catch {
    return null;
  }
}

export function readProductSignoff(path = join(ARTIFACT_DIR, "PRODUCT_SIGNOFF.json")): SignoffRecord | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as SignoffRecord & { ownerEmail?: string };
    return parsed.approved ? parsed : null;
  } catch {
    return null;
  }
}

export function signoffSummary(): { dba: boolean; product: boolean } {
  return {
    dba: readDbaSignoff() != null,
    product: readProductSignoff() != null,
  };
}
