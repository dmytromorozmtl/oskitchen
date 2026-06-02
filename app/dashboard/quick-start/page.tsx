import { redirect } from "next/navigation";

import { QuickStartWizard } from "@/components/onboarding/quick-start-wizard";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function QuickStartPage() {
  const sessionUser = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUser.id },
    select: { onboardingCompleted: true },
  });

  if (profile?.onboardingCompleted) {
    redirect("/dashboard/today");
  }

  return <QuickStartWizard />;
}
