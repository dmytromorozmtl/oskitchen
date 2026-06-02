import { processReferralConversion } from "@/services/referral/referral-service";

/** Record signup attribution and grant free months when code is valid. */
export async function attachReferralToSignup(params: {
  email: string;
  userId: string;
  referralCode?: string | null;
}) {
  await processReferralConversion({
    email: params.email,
    userId: params.userId,
    referralCode: params.referralCode,
  });
}
