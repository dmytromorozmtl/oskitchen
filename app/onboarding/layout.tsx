import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Need to go live fast?</p>
            <p className="text-sm text-muted-foreground">
              Quick Start — 3 steps, starter menu, POS ready in about 15 minutes.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <Link href="/dashboard/quick-start">
              <Zap className="mr-2 h-4 w-4" />
              Quick Start
            </Link>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
