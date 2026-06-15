"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  recordCertificationSignOffAction,
  runChannelCertificationAction,
} from "@/actions/channel-certification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConnectionCertificationRecord } from "@/lib/integrations/channel-certification-types";
import { certificationSignOffComplete } from "@/lib/integrations/channel-certification-types";

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "pass") return "default";
  if (status === "warn") return "secondary";
  if (status === "fail") return "destructive";
  return "outline";
}

export function IntegrationCertificationPanel({
  connectionId,
  providerLabel,
  certification,
  isOwner,
}: {
  connectionId: string | null;
  providerLabel: "WooCommerce" | "Shopify";
  certification: ConnectionCertificationRecord | null;
  isOwner: boolean;
}) {
  const [busy, setBusy] = React.useState(false);

  async function runCertification() {
    if (!connectionId) {
      toast.error("Save credentials first.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("connectionId", connectionId);
      const res = await runChannelCertificationAction(fd);
      if ("error" in res) throw new Error(res.error);
      toast.success(`Certification: ${res.overall}`);
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Certification failed");
    } finally {
      setBusy(false);
    }
  }

  async function signOff(role: "engineering" | "security" | "pilot") {
    if (!connectionId) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("connectionId", connectionId);
      fd.set("role", role);
      const res = await recordCertificationSignOffAction(fd);
      if ("error" in res) throw new Error(res.error);
      toast.success(`${role} sign-off recorded`);
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-off failed");
    } finally {
      setBusy(false);
    }
  }

  const signed = certificationSignOffComplete(certification?.signOff);

  return (
    <Card id="channel-pilot-certification" className="scroll-mt-24 border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Test shop certification</CardTitle>
          <Badge variant="secondary">BETA</Badge>
          {signed ? <Badge variant="outline">Pilot signed</Badge> : null}
        </div>
        <CardDescription>
          Automated checks for {providerLabel} on your test shop. Product stays BETA in marketing
          until all sign-offs and a 7-day pilot — never a fake verified green state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connectionId ? (
          <p className="text-sm text-muted-foreground">
            Save connection credentials, configure webhooks on the test shop, then run
            certification.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                disabled={busy}
                onClick={() => void runCertification()}
              >
                {busy ? "Running…" : "Run certification checks"}
              </Button>
            </div>

            {certification ? (
              <div className="space-y-3">
                <p className="text-sm">
                  Last run{" "}
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(certification.lastRunAt), { addSuffix: true })}
                  </span>{" "}
                  · overall{" "}
                  <Badge
                    variant={
                      certification.overall === "PASS"
                        ? "default"
                        : certification.overall === "PARTIAL"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {certification.overall}
                  </Badge>
                </p>
                <ul className="space-y-2 text-sm">
                  {certification.checks.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
                    >
                      <span className="font-medium">{c.label}</span>
                      <Badge
                        variant={statusVariant(c.status)}
                        className="shrink-0 uppercase text-[10px]"
                      >
                        {c.status}
                      </Badge>
                      <span className="w-full text-xs text-muted-foreground">{c.message}</span>
                    </li>
                  ))}
                </ul>

                {isOwner ? (
                  <div className="space-y-2 rounded-xl border border-dashed border-border/70 p-4">
                    <p className="text-sm font-medium">Sign-off (owner)</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={busy || Boolean(certification.signOff?.engineeringAt)}
                        onClick={() => void signOff("engineering")}
                      >
                        Engineering {certification.signOff?.engineeringAt ? "✓" : ""}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={busy || Boolean(certification.signOff?.securityAt)}
                        onClick={() => void signOff("security")}
                      >
                        Security {certification.signOff?.securityAt ? "✓" : ""}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={busy || Boolean(certification.signOff?.pilotAt)}
                        onClick={() => void signOff("pilot")}
                      >
                        Pilot 7d {certification.signOff?.pilotAt ? "✓" : ""}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pilot sign-off: test shop ran 7 days without cross-tenant data bleed. You may
                      use Pilot certified in sales — not App Store approved.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No certification run yet. Place a test order on your {providerLabel} test shop,
                confirm webhooks under Sales channels, then run checks.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
