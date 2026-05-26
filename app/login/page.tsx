import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { defaultPostAuthPath } from "@/lib/role-navigation";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true, onboardingCompleted: true },
    });
    redirect(
      defaultPostAuthPath(
        profile?.role ?? "OWNER",
        Boolean(profile?.onboardingCompleted),
      ),
    );
  }

  return (
    <div className="relative min-h-screen bg-muted/30">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#286ab8] to-[#1e4f8c] text-xs font-bold text-white">
              K
            </span>
            {APP_NAME}
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage menus, production, and fulfillment.
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-lg backdrop-blur">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            New to KitchenOS?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
