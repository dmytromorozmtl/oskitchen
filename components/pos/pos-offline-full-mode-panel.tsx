"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Database,
  RefreshCw,
  Shield,
  ShoppingCart,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OFFLINE_POS_FULL_MODE_P1_31_CAPABILITIES,
  OFFLINE_POS_FULL_MODE_P1_31_EYEBROW,
  OFFLINE_POS_FULL_MODE_P1_31_HEADLINE,
  OFFLINE_POS_FULL_MODE_P1_31_LIMITATIONS,
  OFFLINE_POS_FULL_MODE_P1_31_OPERATOR_LINKS,
  OFFLINE_POS_FULL_MODE_P1_31_SUBLINE,
  OFFLINE_POS_FULL_MODE_P1_31_TOAST_PARITY,
} from "@/lib/pos/offline-pos-full-mode-p1-31-content";
import { OFFLINE_POS_FULL_MODE_P1_31_TEST_ID } from "@/lib/pos/offline-pos-full-mode-p1-31-policy";

const CAPABILITY_ICONS = [
  Database,
  ShoppingCart,
  CheckCircle2,
  Shield,
  RefreshCw,
  WifiOff,
  Shield,
] as const;

/** P1-31 — Offline POS full mode capability panel (Toast parity). */
export function PosOfflineFullModePanel() {
  return (
    <div className="space-y-8" data-testid={OFFLINE_POS_FULL_MODE_P1_31_TEST_ID}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {OFFLINE_POS_FULL_MODE_P1_31_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {OFFLINE_POS_FULL_MODE_P1_31_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {OFFLINE_POS_FULL_MODE_P1_31_SUBLINE}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Toast parity checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {OFFLINE_POS_FULL_MODE_P1_31_TOAST_PARITY.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {OFFLINE_POS_FULL_MODE_P1_31_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? WifiOff;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={capability.id}
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
            <Shield className="h-4 w-4" aria-hidden />
            PCI noop-v1 review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">noop-v1</strong> is allowed only for empty
            plaintext fields. Non-empty last4/brand must use{" "}
            <strong className="text-foreground">aes-gcm-v1</strong> or card queue is blocked.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {OFFLINE_POS_FULL_MODE_P1_31_LIMITATIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {OFFLINE_POS_FULL_MODE_P1_31_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
