import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { SsoLoginEntry } from "@/components/auth/sso-login-entry";
import { ThemeToggle } from "@/components/theme-toggle";
import { OSKitchenLogo } from "@/components/ui/os-kitchen-logo";
import { getSessionUser } from "@/lib/auth";
import { resolvePostAuthPathForSessionUser } from "@/lib/navigation/resolve-operator-post-auth-path";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(await resolvePostAuthPathForSessionUser(user.id));
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <OSKitchenLogo href="/" size="lg" className="inline-flex" />
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
          <Suspense fallback={null}>
            <div className="mt-6">
              <SsoLoginEntry />
            </div>
          </Suspense>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            New to OS Kitchen?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
