"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import {
  ArrowRightLeft,
  Beer,
  Combine,
  Receipt,
  Split,
  Users,
  Wallet,
} from "lucide-react";

import {
  getServerBankingSummaryAction,
  getTipsReconciliationAction,
} from "@/actions/pos/table-service-depth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isActionSuccess } from "@/lib/action-result";
import {
  TABLE_SERVICE_DEPTH_CAPABILITIES,
  TABLE_SERVICE_DEPTH_EYEBROW,
  TABLE_SERVICE_DEPTH_HEADLINE,
  TABLE_SERVICE_DEPTH_OPERATOR_LINKS,
  TABLE_SERVICE_DEPTH_SUBLINE,
} from "@/lib/pos/table-service-depth-content";
import { BAR_MODE_QUICK_ITEMS } from "@/lib/pos/table-service-depth-operations";
import { TABLE_SERVICE_DEPTH_TEST_IDS } from "@/lib/pos/table-service-depth-policy";
import type { ServerBankingRow, TipsReconciliationResult } from "@/lib/pos/table-service-depth-operations";

const CAPABILITY_ICONS = [Split, Combine, ArrowRightLeft, Receipt, Beer, Wallet, Users] as const;

/** Blueprint P2-89 — table service depth capability panel. */
export function TableServiceDepthPanel() {
  const [bankingRows, setBankingRows] = useState<ServerBankingRow[]>([]);
  const [tipsResult, setTipsResult] = useState<TipsReconciliationResult | null>(null);
  const [declaredTips, setDeclaredTips] = useState("0");
  const [pending, startTransition] = useTransition();

  const loadBanking = useCallback(() => {
    startTransition(async () => {
      const res = await getServerBankingSummaryAction();
      if (isActionSuccess<{ rows: ServerBankingRow[] }>(res) && res.data?.rows) {
        setBankingRows(res.data.rows);
      }
    });
  }, []);

  const runTipsReconcile = useCallback(() => {
    startTransition(async () => {
      const res = await getTipsReconciliationAction({
        declaredTips: Number.parseFloat(declaredTips) || 0,
      });
      if (isActionSuccess<TipsReconciliationResult>(res) && res.data) {
        setTipsResult(res.data);
      }
    });
  }, [declaredTips]);

  return (
    <div className="space-y-8" data-testid={TABLE_SERVICE_DEPTH_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {TABLE_SERVICE_DEPTH_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{TABLE_SERVICE_DEPTH_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {TABLE_SERVICE_DEPTH_SUBLINE}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TABLE_SERVICE_DEPTH_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Receipt;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={TABLE_SERVICE_DEPTH_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={capability.route}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div id="split" className="rounded-2xl border border-border/80 bg-muted/30 p-6">
        <h3 className="text-lg font-semibold">Bar mode quick items</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          typical one-tap paths on POS tabs — verify pricing before service.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {BAR_MODE_QUICK_ITEMS.map((item) => (
            <Badge key={item.id} variant="outline">
              {item.name} · ${item.price.toFixed(2)}
            </Badge>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Server banking</CardTitle>
            <CardDescription>
              Closed-tab tips grouped by server name prefix (e.g. &quot;Alex - Table 4&quot;).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button type="button" variant="outline" onClick={loadBanking} disabled={pending}>
              Load summary
            </Button>
            {bankingRows.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {bankingRows.map((row) => (
                  <li key={row.serverLabel} className="flex justify-between gap-2">
                    <span>{row.serverLabel}</span>
                    <span className="text-muted-foreground">
                      {row.tabCount} tabs · ${row.tipsTotal.toFixed(2)} tips
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No closed tabs yet — BETA guidance only.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tips reconciliation</CardTitle>
            <CardDescription>
              Compare shift-declared tips vs recorded closed-tab tips — not production-ready audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={declaredTips}
                onChange={(event) => setDeclaredTips(event.target.value)}
                placeholder="Declared tips"
                className="max-w-[160px]"
              />
              <Button type="button" variant="outline" onClick={runTipsReconcile} disabled={pending}>
                Reconcile
              </Button>
            </div>
            {tipsResult ? (
              <p
                className={
                  tipsResult.withinTolerance ? "text-sm text-emerald-700" : "text-sm text-amber-700"
                }
              >
                {tipsResult.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABLE_SERVICE_DEPTH_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
