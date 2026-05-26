"use client";

import { useState } from "react";
import { Check, Copy, Download, QrCode } from "lucide-react";

export function QRGenerator({ storeSlug }: { storeSlug: string }) {
  const [tableId, setTableId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateQR() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/storefront/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, tableId: tableId || undefined }),
      });
      const data = (await res.json()) as { qrDataUrl?: string; url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not generate QR");
        return;
      }
      setQrDataUrl(data.qrDataUrl ?? null);
      setMenuUrl(data.url ?? null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!menuUrl) return;
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Table number (optional)"
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
          className="flex-1 h-10 rounded-xl border border-input bg-background px-3 text-sm"
        />
        <button
          type="button"
          onClick={generateQR}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          <QrCode className="h-4 w-4" />
          {loading ? "Generating…" : "Generate QR"}
        </button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {qrDataUrl ? (
        <div className="rounded-xl border bg-card p-6 text-center space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" width={200} height={200} />
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const a = document.createElement("a");
                a.href = qrDataUrl;
                a.download = `qr-${storeSlug}${tableId ? `-table-${tableId}` : ""}.png`;
                a.click();
              }}
              className="inline-flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          {menuUrl ? <p className="text-xs text-muted-foreground break-all">{menuUrl}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
