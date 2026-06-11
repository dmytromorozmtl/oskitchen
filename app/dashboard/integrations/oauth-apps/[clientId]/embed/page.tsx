import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PartnerAppEmbedHost } from "@/components/dashboard/oauth/partner-app-embed-host";
import { Button } from "@/components/ui/button";
import { requireIntegrationsReadPage } from "@/lib/integrations/integrations-page-access";
import { issuePartnerAppEmbedSession } from "@/services/platform/partner-app-embed-service";
import { getMergedPartnerOAuthAppByClientId } from "@/services/platform/partner-oauth-app-registry-service";

type EmbedPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function PartnerAppEmbedPage({ params }: EmbedPageProps) {
  const access = await requireIntegrationsReadPage();
  if (!access.ok) return access.deny;

  const { clientId } = await params;
  const decodedClientId = decodeURIComponent(clientId);
  const app = await getMergedPartnerOAuthAppByClientId(decodedClientId);
  if (!app?.embedUrl) notFound();

  if (!access.canManage) {
    redirect("/dashboard/integrations/oauth-apps");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  const session = await issuePartnerAppEmbedSession({
    ownerUserId: access.actor.userId,
    clientId: decodedClientId,
    origin,
  });

  if (!session.ok) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-8">
        <h1 className="text-2xl font-semibold">Embedded admin unavailable</h1>
        <p className="text-sm text-muted-foreground">{session.error}</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/integrations/oauth-apps">Back to OAuth apps</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Embedded partner admin
          </p>
          <h1 className="text-xl font-semibold">{app.name}</h1>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/oauth-apps">← OAuth apps</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Short-lived signed token passed to partner embed URL. Partner verifies via{" "}
        <code className="rounded bg-muted px-1">POST /api/embed/partner-app/verify</code>.
      </p>
      <PartnerAppEmbedHost
        clientId={decodedClientId}
        appName={app.name}
        embedUrl={session.embedUrl}
        expiresInSeconds={session.expiresInSeconds}
      />
    </div>
  );
}
