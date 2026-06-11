"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Monitor,
  Network,
  Printer,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS,
  HARDWARE_COMPATIBILITY_CENTER_DASHBOARD_LINKS,
  HARDWARE_COMPATIBILITY_CENTER_EYEBROW,
  HARDWARE_COMPATIBILITY_CENTER_HEADLINE,
  HARDWARE_COMPATIBILITY_CENTER_SUBLINE,
  HARDWARE_COMPATIBILITY_CENTER_TAGLINE,
} from "@/lib/hardware/hardware-compatibility-center-content";
import {
  buildPrinterTestHtml,
  CASH_DRAWER_TEST_STATUS,
  runKdsConnectivityCheck,
  runNetworkDiagnostic,
  type KdsConnectivityResult,
  type NetworkDiagnosticResult,
} from "@/lib/hardware/hardware-compatibility-center-diagnostics";
import { HARDWARE_COMPATIBILITY_CENTER_TEST_IDS } from "@/lib/hardware/hardware-compatibility-center-policy";
import { cn } from "@/lib/utils";

type ResultStatus = "idle" | "pass" | "warn" | "fail";

function StatusIcon({ status }: { status: ResultStatus }) {
  if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />;
  if (status === "fail") return <XCircle className="h-5 w-5 text-destructive" aria-hidden />;
  return null;
}

/** Blueprint P2-87 — Works with OS Kitchen compatibility diagnostics. */
export function HardwareCompatibilityCenter() {
  const [networkResult, setNetworkResult] = useState<NetworkDiagnosticResult | null>(null);
  const [kdsResult, setKdsResult] = useState<KdsConnectivityResult | null>(null);
  const [printerRan, setPrinterRan] = useState(false);
  const [cashDrawerChecked, setCashDrawerChecked] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const runPrinterTest = useCallback(() => {
    const blob = new Blob([buildPrinterTestHtml()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer,width=400,height=480");
    if (win) {
      setPrinterRan(true);
      win.focus();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, []);

  const runNetworkTest = useCallback(async () => {
    setRunning("network");
    try {
      const result = await runNetworkDiagnostic();
      setNetworkResult(result);
    } finally {
      setRunning(null);
    }
  }, []);

  const runKdsTest = useCallback(async () => {
    setRunning("kds");
    try {
      const result = await runKdsConnectivityCheck();
      setKdsResult(result);
    } finally {
      setRunning(null);
    }
  }, []);

  return (
    <div className="space-y-10" data-testid={HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[0]}>
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Badge variant="secondary" className="rounded-full">
          {HARDWARE_COMPATIBILITY_CENTER_EYEBROW}
        </Badge>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {HARDWARE_COMPATIBILITY_CENTER_TAGLINE}
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {HARDWARE_COMPATIBILITY_CENTER_HEADLINE}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {HARDWARE_COMPATIBILITY_CENTER_SUBLINE}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[1]}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[0]?.label}</CardTitle>
            </div>
            <CardDescription>{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[0]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[0]?.honestCaveat}
            </p>
            <Button type="button" onClick={runPrinterTest} variant="outline" className="w-full">
              Run printer test
            </Button>
            {printerRan ? (
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <StatusIcon status="pass" />
                Test page opened — confirm receipt printed on default queue.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[2]}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[1]?.label}</CardTitle>
            </div>
            <CardDescription>{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[1]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="outline">{CASH_DRAWER_TEST_STATUS.status}</Badge>
            <p className="text-xs text-muted-foreground">{CASH_DRAWER_TEST_STATUS.message}</p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={cashDrawerChecked}
                onChange={(event) => setCashDrawerChecked(event.target.checked)}
                className="mt-1"
              />
              Staff confirmed manual drawer open on cash sale workflow
            </label>
            {cashDrawerChecked ? (
              <p className="flex items-center gap-2 text-sm text-amber-700">
                <StatusIcon status="warn" />
                Manual workflow verified — auto kick remains placeholder.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[3]}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[2]?.label}</CardTitle>
            </div>
            <CardDescription>{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[2]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[2]?.honestCaveat}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={runKdsTest}
                disabled={running === "kds"}
                variant="outline"
                className="flex-1"
              >
                {running === "kds" ? "Checking…" : "Run KDS connectivity"}
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <Link href="/dashboard/kitchen" target="_blank" rel="noopener noreferrer">
                  Open KDS <ExternalLink className="ml-1 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
            {kdsResult ? (
              <p
                className={cn(
                  "flex items-center gap-2 text-sm",
                  kdsResult.status === "pass" && "text-emerald-700",
                  kdsResult.status === "warn" && "text-amber-700",
                  kdsResult.status === "fail" && "text-destructive",
                )}
              >
                <StatusIcon status={kdsResult.status} />
                {kdsResult.message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[4]}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[3]?.label}</CardTitle>
            </div>
            <CardDescription>{HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[3]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS[3]?.honestCaveat}
            </p>
            <Button
              type="button"
              onClick={runNetworkTest}
              disabled={running === "network"}
              variant="outline"
              className="w-full"
            >
              {running === "network" ? "Diagnosing…" : "Run network diagnostic"}
            </Button>
            {networkResult ? (
              <p
                className={cn(
                  "flex items-center gap-2 text-sm",
                  networkResult.status === "pass" && "text-emerald-700",
                  networkResult.status === "warn" && "text-amber-700",
                  networkResult.status === "fail" && "text-destructive",
                )}
              >
                <StatusIcon status={networkResult.status} />
                {networkResult.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div id="guide" className="rounded-2xl border border-border/80 bg-muted/30 p-6">
        <h3 className="text-lg font-semibold">Operator links</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {HARDWARE_COMPATIBILITY_CENTER_DASHBOARD_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-medium text-primary hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          browser-first — no proprietary terminal lease. verify smoke artifacts before LIVE payment claims.
        </p>
      </div>
    </div>
  );
}
