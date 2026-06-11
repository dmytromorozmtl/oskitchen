import type { Metadata } from "next";

import { AvatarUpload } from "@/components/dashboard/settings/avatar-upload";
import { EmailForm } from "@/components/dashboard/settings/email-form";
import { PasswordForm } from "@/components/dashboard/settings/password-form";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { sessionUser } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUser.id },
    select: { fullName: true, companyName: true, email: true },
  });

  const meta = sessionUser.user_metadata ?? {};
  const phone = typeof meta.phone === "string" ? meta.phone : null;
  const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and security settings.
        </p>
      </div>

      <AvatarUpload initialAvatarUrl={avatarUrl} displayName={profile?.fullName} />
      <ProfileForm
        initialName={profile?.fullName}
        initialCompany={profile?.companyName}
        initialPhone={phone}
      />
      <EmailForm currentEmail={profile?.email ?? sessionUser.email ?? ""} />
      <PasswordForm />
    </div>
  );
}
