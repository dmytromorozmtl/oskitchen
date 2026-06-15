import {
  isImpersonationStepUpConfigured,
  verifyImpersonationStepUp,
} from "@/lib/platform/impersonation-step-up";
import { isImpersonationTotpConfigured, verifyImpersonationTotp } from "@/lib/platform/impersonation-totp";

export type ImpersonationMfaInput = {
  stepUpToken?: string | null;
  totpCode?: string | null;
};

/** Paid pilot: TOTP preferred when configured; else shared step-up token. */
export function isImpersonationMfaConfigured(): boolean {
  return isImpersonationTotpConfigured() || isImpersonationStepUpConfigured();
}

export function verifyImpersonationMfa(input: ImpersonationMfaInput): boolean {
  if (isImpersonationTotpConfigured()) {
    return verifyImpersonationTotp(input.totpCode);
  }
  if (isImpersonationStepUpConfigured()) {
    return verifyImpersonationStepUp(input.stepUpToken);
  }
  return process.env.NODE_ENV !== "production";
}
