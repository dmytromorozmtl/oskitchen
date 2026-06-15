import Link from "next/link";
import { redirect } from "next/navigation";

import { acceptStorefrontInviteByTokenAction } from "@/actions/storefront-team-invite";
import { InviteAcceptClient } from "@/components/invite/invite-accept-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { findInviteByToken } from "@/services/storefront/storefront-team-invite-service";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await findInviteByToken(token);

  if (!invite) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>This link may be invalid or already used.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invite.acceptedAt) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Already accepted</CardTitle>
            <CardDescription>You already have access to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-full">
              <Link href="/dashboard/storefront">Open storefront admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Invitation expired</CardTitle>
            <CardDescription>Ask the store owner to send a new invitation.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const user = await getSessionUser();
  if (user?.email) {
    const res = await acceptStorefrontInviteByTokenAction(token);
    if (res.ok) {
      redirect("/dashboard/storefront/team?invited=1");
    }
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Could not accept</CardTitle>
            <CardDescription>
              {"error" in res ? res.error : "Sign in with the account that received this invitation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={`/login?next=/invite/${encodeURIComponent(token)}`}>Switch account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center p-6">
      <Card className="w-full border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Join team</CardTitle>
          <CardDescription>Accept your invitation to collaborate on this storefront.</CardDescription>
        </CardHeader>
        <CardContent>
          <InviteAcceptClient
            token={token}
            storeName={invite.storefront.publicName}
            workspaceName={invite.workspace.name}
            role={invite.role}
          />
        </CardContent>
      </Card>
    </div>
  );
}
