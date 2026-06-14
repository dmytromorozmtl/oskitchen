import { redirect } from "next/navigation";

import { QuickStartWizard } from "@/components/onboarding/quick-start-wizard";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** 15-minute self-serve Quick Start — profile → menu → integrations → first order. */

export const metadata = {
  title: "Quick Start — 15-minute setup",
  description: "Self-serve onboarding: register, seed menu, pick channels, first order in ~15 minutes.",
};

export default async function QuickStartPage({
  searchParams,
}: {
  searchParams?: Promise<{ phase?: string }>;
}) {
  const sessionUser = await requireSessionUser();
  const params = (await searchParams) ?? {};
  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUser.id },
    select: { onboardingCompleted: true },
  });

  const showOrderPhase = params.phase === "order";
  if (profile?.onboardingCompleted && !showOrderPhase) {
    redirect("/dashboard/today");
  }

  return <QuickStartWizard initialStep={showOrderPhase ? "order" : undefined} />;
}
