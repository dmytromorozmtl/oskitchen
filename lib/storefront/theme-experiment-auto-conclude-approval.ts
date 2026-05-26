import { createHash, randomBytes } from "node:crypto";

import { SITE_URL } from "@/lib/constants";

export function generateAutoConcludeApprovalToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashAutoConcludeApprovalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function autoConcludeApprovalUrls(token: string): { approve: string; reject: string } {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    approve: `${base}/api/storefront/experiment/auto-conclude/approve?token=${encodeURIComponent(token)}`,
    reject: `${base}/api/storefront/experiment/auto-conclude/reject?token=${encodeURIComponent(token)}`,
  };
}
