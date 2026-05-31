"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ensureAppUser } from "@/lib/auth";
import { authCallbackUrl } from "@/lib/auth/public-site-url";
import { safeInternalNextPath } from "@/lib/auth/safe-redirect";
import { resolvePostAuthPathForSessionUser } from "@/lib/navigation/resolve-operator-post-auth-path";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { createClient } from "@/lib/supabase/server";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required").max(200),
  companyName: z.string().max(200).optional(),
  redirect: z.string().optional(),
  referralCode: z.string().max(50).optional(),
});

function formatAuthFieldError(error: z.ZodError): string {
  const first = error.flatten().fieldErrors;
  for (const key of Object.keys(first)) {
    const msgs = first[key as keyof typeof first];
    if (msgs?.[0]) return msgs[0];
  }
  return "Invalid input. Please check the form and try again.";
}

export async function signInAction(formData: FormData) {
  try {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const rawRedirect = String(formData.get("redirect") ?? "").trim() || null;
    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return fail(error.message);

    if (data.user) {
      await ensureAppUser(data.user.id, data.user.email ?? email);
    }

    let defaultPath = "/dashboard/today";
    if (data.user) {
      defaultPath = await resolvePostAuthPathForSessionUser(data.user.id);
    }

    const redirectTo = safeInternalNextPath(rawRedirect, defaultPath);
    revalidatePath("/", "layout");
    return ok({ redirectTo });
  } catch (err) {
    console.error("signInAction error:", err);
    return fail(safeError(err));
  }
}

export async function signUpAction(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = signUpSchema.safeParse(raw);

    if (!parsed.success) {
      return fail(formatAuthFieldError(parsed.error));
    }

    const { email, password, fullName, companyName, redirect, referralCode } =
      parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authCallbackUrl(),
        data: {
          full_name: fullName,
          company_name: companyName || undefined,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return fail("This email is already registered. Please sign in instead.");
      }
      if (error.message.toLowerCase().includes("password")) {
        return fail("Password is too weak. Please use a stronger password.");
      }
      return fail(error.message);
    }

    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      return fail("This email is already registered. Please sign in instead.");
    }

    if (data.user) {
      await ensureAppUser(data.user.id, email);
      await supabase.auth.updateUser({
        data: { full_name: fullName, company_name: companyName },
      });
      const cookieStore = await cookies();
      const referralFromCookie = cookieStore.get("kos_ref")?.value?.trim();
      const code = referralCode?.trim() || referralFromCookie || undefined;
      const { attachReferralToSignup } = await import("@/lib/growth/referrals");
      await attachReferralToSignup({
        email,
        userId: data.user.id,
        referralCode: code,
      });
      const { trackUsageEvent } = await import("@/lib/usage");
      void trackUsageEvent({
        userId: data.user.id,
        eventName: "account_created",
      });
    }

    revalidatePath("/", "layout");

    const emailConfirmed = Boolean(
      data.user?.email_confirmed_at ?? data.user?.confirmed_at,
    );
    const checkEmailMessage =
      "Account created! Please check your email to confirm your address, then sign in.";

    if (!data.session || !emailConfirmed) {
      if (data.session) {
        await supabase.auth.signOut();
      }
      return ok({ message: checkEmailMessage,
        redirectTo: safeInternalNextPath(redirect, "/login"), });
    }

    return ok({ message: "Welcome to OS Kitchen! Let's set up your workspace.",
      redirectTo: safeInternalNextPath(redirect, "/onboarding"), });
  } catch (err) {
    console.error("signUpAction error:", err);
    return fail(safeError(err));
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authCallbackUrl("/dashboard/settings"),
  });

  if (error) return { error: error.message };
  return {
    success: "Password reset email sent. Follow the link to set a new password.",
  };
}
