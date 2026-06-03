"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Code2, Package, Percent, Shield } from "lucide-react";
import { toast } from "sonner";

import {
  publishAppMarketplaceListingAction,
  rejectAppMarketplaceListingAction,
  submitAppMarketplaceListingAction,
} from "@/actions/app-marketplace";
import { PARTNER_OAUTH_SCOPE_LABEL, PARTNER_OAUTH_SCOPES } from "@/lib/developer/partner-oauth-scopes";
import type { AppMarketplaceDashboard, AppMarketplaceListing } from "@/lib/platform/app-marketplace-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: AppMarketplaceDashboard;
  defaultEmail: string;
};

const STATUS_VARIANT: Record<AppMarketplaceListing["status"], "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  in_review: "default",
  published: "secondary",
  sandbox: "secondary",
  suspended: "destructive",
};

function ListingCard({ listing }: { listing: AppMarketplaceListing }) {
  return (
    <div className="rounded-lg border p-3 space-y-2" data-testid={`marketplace-app-${listing.clientId}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{listing.name}</p>
          <p className="text-xs text-muted-foreground">{listing.publisher} · {listing.clientId}</p>
        </div>
        <Badge variant={STATUS_VARIANT[listing.status]} className="capitalize">
          {listing.status.replace(/_/g, " ")}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
      <p className="text-xs text-muted-foreground">
        Rev share {listing.developerSharePercent}/{listing.platformSharePercent} (dev/platform)
      </p>
    </div>
  );
}

export function AppMarketplacePanel({ dashboard, defaultEmail }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [scopes, setScopes] = useState<string[]>(["read:orders"]);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  function run(action: () => Promise<{ ok: boolean; error?: string; data?: { message?: string } }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Request failed.");
        return;
      }
      toast.success(result.data?.message ?? "Done.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="app-marketplace-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" aria-hidden />
            API Marketplace
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Submit OAuth apps, pass platform review, publish to the catalog — {dashboard.revenueShare.summary}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/oauth-apps">Install apps →</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl">{dashboard.stats.publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In review</CardDescription>
            <CardTitle className="text-2xl">{dashboard.stats.inReviewCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Percent className="h-3.5 w-3.5" aria-hidden />
              Revenue share
            </CardDescription>
            <CardTitle className="text-lg">
              {dashboard.revenueShare.developerPercent}/{dashboard.revenueShare.platformPercent}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" aria-hidden />
            Published catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {dashboard.publishedApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published apps yet.</p>
          ) : (
            dashboard.publishedApps.map((app) => <ListingCard key={app.clientId} listing={app} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submit an app</CardTitle>
          <CardDescription>Creates an IN_REVIEW listing for platform approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() =>
                submitAppMarketplaceListingAction({
                  clientId: String(fd.get("clientId") ?? ""),
                  name: String(fd.get("name") ?? ""),
                  publisher: String(fd.get("publisher") ?? ""),
                  description: String(fd.get("description") ?? ""),
                  redirectUris: String(fd.get("redirectUris") ?? ""),
                  allowedScopes: scopes as never[],
                  embedUrl: String(fd.get("embedUrl") ?? ""),
                  contactEmail: String(fd.get("contactEmail") ?? ""),
                  honestyNote: String(fd.get("honestyNote") ?? ""),
                }),
              );
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="clientId">Client ID</Label>
                <Input id="clientId" name="clientId" required placeholder="my-kitchen-app" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input id="contactEmail" name="contactEmail" type="email" required defaultValue={defaultEmail} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">App name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publisher">Publisher</Label>
              <Input id="publisher" name="publisher" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="redirectUris">Redirect URIs (one per line)</Label>
              <textarea
                id="redirectUris"
                name="redirectUris"
                required
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {PARTNER_OAUTH_SCOPES.map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs",
                      scopes.includes(scope) && "border-primary bg-primary/10",
                    )}
                    onClick={() =>
                      setScopes((prev) =>
                        prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
                      )
                    }
                  >
                    {PARTNER_OAUTH_SCOPE_LABEL[scope]}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" size="sm" disabled={pending} data-testid="marketplace-submit-app">
              Submit for review
            </Button>
          </form>
        </CardContent>
      </Card>

      {dashboard.mySubmissions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My submissions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {dashboard.mySubmissions.map((app) => (
              <ListingCard key={app.id} listing={app} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {dashboard.canReview && dashboard.reviewQueue.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden />
              Review queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.reviewQueue.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 space-y-3" data-testid={`review-${item.id}`}>
                <ListingCard listing={item} />
                <p className="text-xs text-muted-foreground">Contact: {item.contactEmail}</p>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Rejection notes (required to reject)"
                  value={rejectNotes[item.id] ?? ""}
                  onChange={(e) =>
                    setRejectNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    data-testid="marketplace-publish"
                    onClick={() => run(() => publishAppMarketplaceListingAction(item.id, false))}
                  >
                    Publish
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => run(() => publishAppMarketplaceListingAction(item.id, true))}
                  >
                    Sandbox only
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() =>
                      run(() => rejectAppMarketplaceListingAction(item.id, rejectNotes[item.id] ?? ""))
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
