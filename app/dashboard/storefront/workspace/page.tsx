import Link from "next/link";

import {
  createAdditionalStorefrontAction,
  setPrimaryStorefrontAction,
} from "@/actions/storefront-multi-store";
import {
  createWorkspaceForStorefrontAction,
  linkStorefrontToBrandAction,
  linkStorefrontToWorkspaceAction,
} from "@/actions/storefront-workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { asVoidFormAction, asVoidFormActionNoArg } from "@/lib/actions/server-form-action";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { compositeMarketHostLabel } from "@/lib/storefront/market-host-resolve";
import { parseStorefrontMarketsFromSettingsCenter } from "@/lib/storefront/markets";
import { listOwnerStorefronts } from "@/lib/storefront/resolve-owner-storefront";
import { prisma } from "@/lib/prisma";

export default async function StorefrontWorkspacePage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const { sessionUser: user, dataUserId } = await getTenantActor();
  const ownerUserId = pageAccess.userId;
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: dataUserId },
    include: { workspace: { select: { id: true, name: true } } },
  });
  const workspaceIds = memberships.map((m) => m.workspaceId);

  const [sf, ownedStores, kitchen, workspaceStorefronts] = await Promise.all([
    prisma.storefrontSettings.findUnique({
      where: { id: pageAccess.access.storefront.id },
    }),
    listOwnerStorefronts(user.id),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { settingsCenterJson: true },
    }),
    workspaceIds.length > 0
      ? prisma.storefrontSettings.findMany({
          where: { workspaceId: { in: workspaceIds } },
          select: { id: true, storeSlug: true, publicName: true, published: true, userId: true },
          orderBy: { storeSlug: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const markets = parseStorefrontMarketsFromSettingsCenter(kitchen?.settingsCenterJson);
  const rootDomain = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN?.trim();
  const brands = sf?.workspaceId
    ? await prisma.brand.findMany({
        where: { workspaceId: sf.workspaceId },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Workspace stores</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Multi-storefront scaffold: one workspace can host several published storefronts. Team invites
            require a linked workspace.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/storefront">← Overview</Link>
        </Button>
      </div>

      {!sf ? (
        <p className="text-muted-foreground">Publish storefront overview first.</p>
      ) : (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Current storefront</CardTitle>
              <CardDescription>workspaceId: {sf.workspaceId ?? "not linked"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!sf.workspaceId ? (
                <>
                  <form action={asVoidFormActionNoArg(createWorkspaceForStorefrontAction)}>
                    <Button type="submit" className="rounded-full">
                      Create workspace for this storefront
                    </Button>
                  </form>
                  {memberships.length > 0 ? (
                    <form action={asVoidFormAction(linkStorefrontToWorkspaceAction)} className="space-y-3 border-t pt-4">
                      <Label htmlFor="workspaceId">Or link to existing workspace</Label>
                      <select
                        id="workspaceId"
                        name="workspaceId"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        {memberships.map((m) => (
                          <option key={m.workspaceId} value={m.workspaceId}>
                            {m.workspace.name}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="secondary" className="rounded-full">
                        Link workspace
                      </Button>
                    </form>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Linked. Manage team on{" "}
                  <Link href="/dashboard/storefront/team" className="underline">
                    Team
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>

          {brands.length > 0 ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Brand linkage (multi-brand scaffold)</CardTitle>
                <CardDescription>
                  Link this storefront to a workspace brand. Future: one storefront per brand in the same workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Current brandId: {sf.brandId ?? "—"}
                </p>
                <form action={asVoidFormAction(linkStorefrontToBrandAction)} className="flex flex-wrap gap-2">
                  <select
                    name="brandId"
                    className="flex h-10 min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                    defaultValue={sf.brandId ?? ""}
                  >
                    <option value="" disabled>
                      Select brand
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" variant="secondary" className="rounded-full">
                    Link brand
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {ownedStores.length > 0 ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Your storefronts</CardTitle>
                <CardDescription>
                  Multi-store: create additional shops under the same account. Use the switcher in the admin header.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {ownedStores.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
                    >
                      <span>
                        {s.publicName}{" "}
                        <span className="font-mono text-xs text-muted-foreground">/s/{s.storeSlug}</span>
                        {s.isPrimary ? (
                          <span className="ml-2 text-xs font-medium text-primary">primary</span>
                        ) : null}
                      </span>
                      {!s.isPrimary ? (
                        <form action={asVoidFormAction(setPrimaryStorefrontAction)}>
                          <input type="hidden" name="storefrontId" value={s.id} />
                          <Button type="submit" variant="ghost" size="sm" className="h-8 rounded-full text-xs">
                            Set primary
                          </Button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <form action={asVoidFormAction(createAdditionalStorefrontAction)} className="space-y-3 border-t border-border/60 pt-4">
                  <p className="text-sm font-medium">Add another storefront</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="publicName">Public name</Label>
                      <input
                        id="publicName"
                        name="publicName"
                        required
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Weekend pop-up"
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeSlug">URL slug</Label>
                      <input
                        id="storeSlug"
                        name="storeSlug"
                        required
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                        placeholder="weekend-popup"
                      />
                    </div>
                  </div>
                  {brands.length > 0 ? (
                    <div>
                      <Label htmlFor="brandId">Brand (optional)</Label>
                      <select
                        id="brandId"
                        name="brandId"
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">—</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <Button type="submit" className="rounded-full">
                    Create storefront
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {workspaceStorefronts.length > 0 ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Storefronts in your workspaces</CardTitle>
                <CardDescription>{workspaceStorefronts.length} storefront(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {workspaceStorefronts.map((s) => (
                    <li key={s.id} className="flex justify-between rounded-lg border border-border/60 px-3 py-2">
                      <span>
                        {s.publicName}{" "}
                        <span className="font-mono text-xs text-muted-foreground">/s/{s.storeSlug}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.published ? "published" : "draft"}
                        {s.userId === user.id ? " · yours" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {markets.length > 0 && rootDomain ? (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle>Market vanity hosts</CardTitle>
                <CardDescription>
                  Add wildcard <code className="text-xs">*.{rootDomain}</code> on Vercel — see{" "}
                  <code className="text-xs">docs/STOREFRONT_WILDCARD_DNS.md</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 font-mono text-xs">
                {markets.map((m) => {
                  const host = m.hostSubdomain ?? compositeMarketHostLabel(sf.storeSlug, m.id);
                  return (
                    <p key={m.id}>
                      {m.name}: https://{host}.{rootDomain}
                    </p>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
