import { redirect } from "next/navigation";

import { AutoOnboardingChat } from "@/components/onboarding/auto-onboarding-chat";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Automated onboarding",
  description: "AI-assisted restaurant setup in five questions.",
};

export default async function AutoOnboardingPage() {
  const user = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { onboardingCompleted: true },
  });

  if (profile?.onboardingCompleted) {
    redirect("/dashboard/today");
  }

  return <AutoOnboardingChat />;
}
