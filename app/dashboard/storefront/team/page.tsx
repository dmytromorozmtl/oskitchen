import Link from "next/link";

import { updateStorefrontStaffAccessFormAction } from "@/actions/storefront-team";
import { StorefrontTeamInvitePanel } from "@/components/dashboard/storefront/storefront-team-invite-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import {
  parseStorefrontStaffAccess,
  STOREFRONT_ADMIN_PERMISSIONS,
} from "@/lib/storefront/storefront-admin-access";
import { prisma } from "@/lib/prisma";
import {
  listPendingStorefrontInvites,
  migrateLegacyPendingInvitesForOwner,
} from "@/services/storefront/storefront-team-invite-service";

const PERM_LABELS: Record<string, string> = {
  "storefront.settings": "Storefront settings",
  "storefront.catalog": "Catalog (variants & modifiers)",
  "storefront.markets": "Markets",
  "storefront.theme": "Theme & pages",
  "storefront.orders": "Orders (read)",
  "storefront.team": "Team access",
};

export default async function StorefrontTeamPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.team");
  if (!pageAccess.ok) return pageAccess.deny;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    select: { id: true, storeSlug: true, workspaceId: true, userId: true },
  });

  await migrateLegacyPendingInvitesForOwner(pageAccess.userId);

  const [kitchen, members, pendingInvites] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId: pageAccess.userId },
      select: { settingsCenterJson: true },
    }),
    sf?.workspaceId
      ? prisma.workspaceMember.findMany({
          where: { workspaceId: sf.workspaceId },
          include: { userProfile: { select: { email: true, fullName: true } } },
        })
      : Promise.resolve([]),
    sf?.id ? listPendingStorefrontInvites(sf.id) : Promise.resolve([]),
  ]);

  const staffAccess = parseStorefrontStaffAccess(kitchen?.settingsCenterJson);

  const memberRows = members.map((m) => ({
    id: m.id,
    role: m.role,
    email: m.userProfile.email,
    name: m.userProfile.fullName,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Storefront team</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Invite workspace members by email. They receive a link to{" "}
            <code className="text-xs">/invite/…</code> and join automatically when they sign in.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/storefront/team/audit">Audit log</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/storefront">← Overview</Link>
          </Button>
        </div>
      </div>

      {!sf ? (
        <p className="text-muted-foreground">Publish storefront overview first.</p>
      ) : (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Invite teammates</CardTitle>
              <CardDescription>
                Existing users join immediately. Others get an email with a secure accept link (30-day expiry).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StorefrontTeamInvitePanel
                workspaceLinked={Boolean(sf.workspaceId)}
                members={memberRows}
                pendingInvites={pendingInvites}
              />
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Staff permissions</CardTitle>
              <CardDescription>
                When enabled, workspace STAFF role gets the checked permissions. ADMIN/OWNER get full access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStorefrontStaffAccessFormAction} className="space-y-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="allowWorkspaceStaff"
                    defaultChecked={staffAccess.allowWorkspaceStaff}
                    className="rounded"
                  />
                  Allow workspace staff to access storefront admin
                </label>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">STAFF role can:</legend>
                  {STOREFRONT_ADMIN_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="staffPermissions"
                        value={perm}
                        defaultChecked={staffAccess.staffPermissions.includes(perm)}
                        className="rounded"
                      />
                      {PERM_LABELS[perm] ?? perm}
                    </label>
                  ))}
                </fieldset>
                <Button type="submit" className="rounded-full">
                  Save team access
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
