"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

type PartnerAppEmbedHostProps = {
  clientId: string;
  appName: string;
  embedUrl: string;
  expiresInSeconds: number;
};

export function PartnerAppEmbedHost({
  clientId,
  appName,
  embedUrl,
  expiresInSeconds,
}: PartnerAppEmbedHostProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="flex h-[min(72vh,720px)] flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/20">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">{appName}</span>
          <span className="ml-2 font-mono">{clientId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Session TTL ~{Math.round(expiresInSeconds / 60)} min</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 hover:bg-muted"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh token
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <p>Embedded surface failed to load. Verify partner embed URL and frame-ancestors policy.</p>
        </div>
      ) : (
        <div className="relative flex-1">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          <iframe
            title={`${appName} embedded admin`}
            src={embedUrl}
            className="h-full w-full border-0 bg-background"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
