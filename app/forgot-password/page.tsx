import Link from "next/link";

import { ForgotForm } from "@/components/auth/forgot-form";
import { OSKitchenLogo } from "@/components/ui/os-kitchen-logo";
import { A11Y_INLINE_LINK } from "@/lib/a11y/ui-classes";

export const metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <OSKitchenLogo href="/" size="lg" className="inline-flex" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We will email you a secure link to choose a new password.
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-lg backdrop-blur">
          <ForgotForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className={A11Y_INLINE_LINK}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
