import Link from "next/link";

import { ForgotForm } from "@/components/auth/forgot-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
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
            Reset password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We will email you a secure link to choose a new password.
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-lg backdrop-blur">
          <ForgotForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
