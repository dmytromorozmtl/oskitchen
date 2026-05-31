import Link from "next/link";
import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUser.id },
  });
  if (profile?.onboardingCompleted) {
    redirect("/dashboard/today");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 via-background to-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 py-4 backdrop-blur sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          OS Kitchen
        </Link>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Guided setup · saves automatically each step
        </span>
      </header>
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">{children}</div>
    </div>
  );
}
