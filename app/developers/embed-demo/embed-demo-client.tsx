"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { PublicShellClient } from "@/components/marketing/public-shell-client";
import { Badge } from "@/components/ui/badge";

type VerifyResponse =
  | {
      ok: true;
      session: {
        installationId: string;
        workspaceId: string | null;
        clientId: string;
        userId: string;
        issuedAt: number;
        expiresAt: number;
      };
    }
  | { ok: false; error: string };

export default function PartnerEmbedDemoClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("embed_token");
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const response = await fetch("/api/embed/partner-app/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embed_token: token }),
      });
      const json = (await response.json()) as VerifyResponse;
      if (!cancelled) {
        setResult(json);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const ttlLabel = useMemo(() => {
    if (!result || !result.ok) return null;
    const seconds = result.session.expiresAt - Math.floor(Date.now() / 1000);
    return `${Math.max(0, Math.round(seconds / 60))} min remaining`;
  }, [result]);

  return (
    <PublicShellClient>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Badge variant="outline" className="mb-3 rounded-full">
          Embed demo · Phase 4
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Partner embedded admin surface</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sandbox iframe target for OpsBridge. KitchenOS passes{" "}
          <code className="rounded bg-muted px-1 text-xs">embed_token</code> on the query string; partners
          verify server-side via{" "}
          <code className="rounded bg-muted px-1 text-xs">POST /api/embed/partner-app/verify</code>.
        </p>

        {!token ? (
          <p className="mt-6 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
            Open this page from an installed OAuth app&apos;s embedded admin link to receive a signed session
            token.
          </p>
        ) : null}

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying embed token…
          </div>
        ) : null}

        {result && !result.ok ? (
          <p className="mt-6 text-sm text-destructive">Verification failed: {result.error}</p>
        ) : null}

        {result?.ok ? (
          <div className="mt-6 space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4 font-mono text-xs">
            <p className="font-sans text-sm font-medium text-foreground">Verified session {ttlLabel}</p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(result.session, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </PublicShellClient>
  );
}
