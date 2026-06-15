"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  issueDigitalGiftCardAction,
  issuePhysicalGiftCardBatchAction,
  markPhysicalBatchPrintedAction,
  saveGiftCardProgramAction,
} from "@/actions/loyalty-gift-cards";
import { getActionError } from "@/lib/action-result";
import type { GiftCardProgramSettings } from "@/lib/loyalty/gift-cards-settings";
import type { EnrichedGiftCard, GiftCardHubSummary } from "@/services/loyalty/gift-cards-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type GiftCardsHubProps = {
  summary: GiftCardHubSummary;
  cards: EnrichedGiftCard[];
  canManage: boolean;
};

export function GiftCardsHub({ summary, cards, canManage }: GiftCardsHubProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [program, setProgram] = useState<GiftCardProgramSettings>(summary.program);
  const [digitalAmount, setDigitalAmount] = useState(String(summary.program.denominations[0] ?? 50));
  const [physicalAmount, setPhysicalAmount] = useState(
    String(summary.program.denominations[1] ?? summary.program.denominations[0] ?? 50),
  );
  const [physicalCount, setPhysicalCount] = useState("5");

  const physicalBatches = useMemo(() => {
    const map = new Map<string, EnrichedGiftCard[]>();
    for (const card of cards) {
      if (card.delivery !== "physical" || !card.batchId) continue;
      const list = map.get(card.batchId) ?? [];
      list.push(card);
      map.set(card.batchId, list);
    }
    return [...map.entries()].sort((a, b) => b[1][0]!.updatedAt.getTime() - a[1][0]!.updatedAt.getTime());
  }, [cards]);

  const run = (fn: () => Promise<{ error?: string } | void | { ok?: boolean }>) => {
    startTransition(async () => {
      setMessage(null);
      const result = await fn();
      const err = getActionError(result);
      if (err) {
        setMessage(err);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Digital active</CardDescription>
            <CardTitle className="text-2xl">{summary.digitalActive}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Physical active</CardDescription>
            <CardTitle className="text-2xl">{summary.physicalActive}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting print</CardDescription>
            <CardTitle className="text-2xl">{summary.physicalUnprinted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding balance</CardDescription>
            <CardTitle className="text-2xl">${summary.outstandingBalance.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {message ? <p className="text-sm text-destructive">{message}</p> : null}

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Program settings</CardTitle>
            <CardDescription>Enable digital email delivery and physical card batches.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              action={(fd) => run(() => saveGiftCardProgramAction(fd))}
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="digitalEnabled"
                  value="true"
                  checked={program.digitalEnabled}
                  onChange={(e) => setProgram((p) => ({ ...p, digitalEnabled: e.target.checked }))}
                />
                Digital gift cards
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="physicalEnabled"
                  value="true"
                  checked={program.physicalEnabled}
                  onChange={(e) => setProgram((p) => ({ ...p, physicalEnabled: e.target.checked }))}
                />
                Physical gift cards
              </label>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="denominations">Preset amounts (comma-separated)</Label>
                <Input
                  id="denominations"
                  name="denominations"
                  defaultValue={program.denominations.join(", ")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="physicalCodePrefix">Physical code prefix</Label>
                <Input
                  id="physicalCodePrefix"
                  name="physicalCodePrefix"
                  defaultValue={program.physicalCodePrefix}
                  maxLength={6}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Save program
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Digital gift cards</CardTitle>
            <CardDescription>
              Email-ready codes — redeem at POS. Separate from storefront ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManage && program.digitalEnabled ? (
              <form
                className="space-y-3"
                action={(fd) => run(() => issueDigitalGiftCardAction(fd))}
              >
                <div className="space-y-1">
                  <Label htmlFor="digital-amount">Amount ($)</Label>
                  <Input
                    id="digital-amount"
                    name="amount"
                    type="number"
                    min={1}
                    value={digitalAmount}
                    onChange={(e) => setDigitalAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="recipientEmail">Recipient email (optional)</Label>
                  <Input id="recipientEmail" name="recipientEmail" type="email" />
                </div>
                <Button type="submit" disabled={pending} className="rounded-full">
                  Issue digital card
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Digital issuance disabled or view-only.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Physical gift cards</CardTitle>
            <CardDescription>
              Print batch codes for card stock — mark printed when handed to guests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManage && program.physicalEnabled ? (
              <form
                className="space-y-3"
                action={(fd) => run(() => issuePhysicalGiftCardBatchAction(fd))}
              >
                <div className="space-y-1">
                  <Label htmlFor="physical-amount">Amount per card ($)</Label>
                  <Input
                    id="physical-amount"
                    name="amount"
                    type="number"
                    min={1}
                    value={physicalAmount}
                    onChange={(e) => setPhysicalAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="count">Cards in batch</Label>
                  <Input
                    id="count"
                    name="count"
                    type="number"
                    min={1}
                    max={50}
                    value={physicalCount}
                    onChange={(e) => setPhysicalCount(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={pending} className="rounded-full">
                  Generate physical batch
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Physical issuance disabled or view-only.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Physical batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {physicalBatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No physical batches yet.</p>
          ) : (
            physicalBatches.map(([batchId, batchCards]) => {
              const unprinted = batchCards.filter((c) => !c.printed).length;
              return (
                <div
                  key={batchId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-mono text-sm">{batchId}</p>
                    <p className="text-xs text-muted-foreground">
                      {batchCards.length} cards · {unprinted} awaiting print
                    </p>
                  </div>
                  {canManage && unprinted > 0 ? (
                    <form action={(fd) => run(() => markPhysicalBatchPrintedAction(fd))}>
                      <input type="hidden" name="batchId" value={batchId} />
                      <Button type="submit" size="sm" variant="outline" disabled={pending}>
                        Mark printed
                      </Button>
                    </form>
                  ) : (
                    <Badge variant="secondary">Printed</Badge>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent cards</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {cards.slice(0, 20).map((card) => (
              <li key={card.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-mono">{card.code}</span>
                <span className="flex items-center gap-2">
                  <Badge variant={card.delivery === "physical" ? "outline" : "secondary"}>
                    {card.delivery}
                  </Badge>
                  <span>${card.balance.toFixed(2)}</span>
                  <span className="text-muted-foreground">{card.status}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
