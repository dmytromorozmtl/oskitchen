import { prisma } from "@/lib/prisma";

/** Record signup attribution when `referralCode` matches an active code. */
export async function attachReferralToSignup(params: {
  email: string;
  userId: string;
  referralCode?: string | null;
}) {
  const code = params.referralCode?.trim();
  if (!code || code.length > 64) return;

  const normalized = code.toUpperCase();
  const ref = await prisma.referralCode.findFirst({
    where: {
      active: true,
      OR: [{ code: normalized }, { code: code }],
    },
  });
  if (!ref || ref.userId === params.userId) return;

  await prisma.referralEvent.create({
    data: {
      referralCodeId: ref.id,
      email: params.email.toLowerCase().slice(0, 320),
      source: "signup",
      convertedUserId: params.userId,
    },
  });
}
