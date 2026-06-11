"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, RefreshCw, ShoppingCart, Shield, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  POS_OFFLINE_MODE_V1_CAPABILITIES,
  POS_OFFLINE_MODE_V1_EYEBROW,
  POS_OFFLINE_MODE_V1_HEADLINE,
  POS_OFFLINE_MODE_V1_OPERATOR_LINKS,
  POS_OFFLINE_MODE_V1_SUBLINE,
} from "@/lib/pos/pos-offline-mode-v1-content";
import { POS_OFFLINE_MODE_V1_TEST_IDS } from "@/lib/pos/pos-offline-mode-v1-policy";
import { POS_OFFLINE_LIMITATIONS } from "@/lib/pos/pos-offline";

const CAPABILITY_ICONS = [
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  Shield,
  CheckCircle2,
] as const;

/** Blueprint P2-88 — POS offline mode v1.0 capability panel. */
export function PosOfflineModeV1Panel() {
  return (
    <div className="space-y-8" data-testid={POS_OFFLINE_MODE_V1_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {POS_OFFLINE_MODE_V1_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{POS_OFFLINE_MODE_V1_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {POS_OFFLINE_MODE_V1_SUBLINE}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {POS_OFFLINE_MODE_V1_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? WifiOff;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={POS_OFFLINE_MODE_V1_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <WifiOff className="h-4 w-4" aria-hidden />
            Offline payment caveat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {POS_OFFLINE_LIMITATIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            EMV store-and-forward is not certified — use cash or mark-paid-after-external-terminal while offline.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {POS_OFFLINE_MODE_V1_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
