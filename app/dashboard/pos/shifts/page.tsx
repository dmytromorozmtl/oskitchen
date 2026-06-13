import Link from "next/link";

import { posCloseShiftFormAction, posOpenShiftFormAction } from "@/actions/pos";
import { PosShiftsCloseoutFlowProofPanel } from "@/components/dashboard/pos/pos-shifts-closeout-flow-proof-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { buildShiftCloseoutFlowProofSlice } from "@/lib/commercial/era20-shift-closeout-flow-proof-era20";
import { PosShiftCloseAttentionStrip } from "@/components/dashboard/pos-shift-close-attention-strip";
import { PosShiftCloseHero } from "@/components/dashboard/pos-shift-close-hero";
import { PosShiftCloseForm } from "@/components/dashboard/pos-shift-close-form";
import { PosShiftCloseHistoryPanel } from "@/components/dashboard/pos-shift-close-history-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  parseShiftCloseHistoryRangeParam,
  resolveShiftCloseHistoryRangeBounds,
  SHIFT_CLOSE_HISTORY_FILTERED_LIMIT,
  SHIFT_CLOSE_HISTORY_RANGE_LABEL,
} from "@/lib/pos/pos-shift-close-history-range-era18";
import { buildPosShiftCloseFocusSnapshot } from "@/lib/pos/pos-shift-close-focus-era18";
import { shouldPrioritizePosShiftCloseSection } from "@/lib/pos/pos-shift-close-clarity-era19";
import { POS_SHIFT_CLOSE_FORM_ANCHOR } from "@/lib/pos/pos-shift-close-clarity-era19-policy";
import { prisma } from "@/lib/prisma";
import { listPosRegisters } from "@/services/pos/pos-register-service";
import {
  listOpenShiftCloseoutPreviews,
  listRecentClosedShiftSummaries,
} from "@/services/pos/pos-shift-service";

export default async function PosShiftsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const actor = await requireWorkspacePermissionActor();
  const resolvedSearchParams = (await searchParams) ?? {};
  const rangePreset = parseShiftCloseHistoryRangeParam(resolvedSearchParams.range);
  const rangeBounds = resolveShiftCloseHistoryRangeBounds(rangePreset);
  const canOpenShift = hasPermission(actor.granted, "pos.shift.open");
  const canCloseShift = hasPermission(actor.granted, "pos.shift.close");
  if (!canOpenShift && !canCloseShift) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const canViewShiftHistory = canOpenShift || canCloseShift;

  const [registers, staff, closeoutPreviews, closedShiftHistory] = await Promise.all([
    listPosRegisters(actor.userId),
    prisma.staffMember.findMany({
      where: { userId: actor.userId, status: "ACTIVE", archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    canCloseShift ? listOpenShiftCloseoutPreviews(actor.userId) : Promise.resolve([]),
    canViewShiftHistory
      ? listRecentClosedShiftSummaries(actor.userId, SHIFT_CLOSE_HISTORY_FILTERED_LIMIT, rangeBounds)
      : Promise.resolve([]),
  ]);

  const shiftCloseFocus = buildPosShiftCloseFocusSnapshot({
    openPreviews: closeoutPreviews,
    closedHistory: closedShiftHistory,
  });
  const prioritizeCloseout = shouldPrioritizePosShiftCloseSection(closeoutPreviews.length);
  const shiftCloseoutFlowProof = buildShiftCloseoutFlowProofSlice({
    viewerCanOpenShift: canOpenShift,
    viewerCanCloseShift: canCloseShift,
    hasOpenShift: closeoutPreviews.length > 0,
  });

  const closeShiftCard = canCloseShift ? (
    <Card
      className="max-w-lg border-border/80 shadow-sm lg:max-w-none"
      id={POS_SHIFT_CLOSE_FORM_ANCHOR}
    >
      <CardHeader>
        <CardTitle>Close shift</CardTitle>
        <CardDescription>
          Follow the checklist — count the drawer, review expected cash, then close. Card sales stay
          out of expected cash.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PosShiftCloseForm
          staff={staff}
          previews={closeoutPreviews}
          formAction={posCloseShiftFormAction}
        />
      </CardContent>
    </Card>
  ) : null;

  const openShiftCard = canOpenShift ? (
    <Card className="max-w-lg border-border/80 shadow-sm lg:max-w-none">
      <CardHeader>
        <CardTitle>Open shift</CardTitle>
        <CardDescription>Requires Team plan entitlement for `pos_shifts`.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={posOpenShiftFormAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="registerId">Register</Label>
            <select
              id="registerId"
              name="registerId"
              required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
            >
              {registers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staffId">Opened by</Label>
            <select
              id="staffId"
              name="staffId"
              required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingCash">Opening cash</Label>
            <Input
              id="openingCash"
              name="openingCash"
              type="number"
              step="0.01"
              defaultValue="0"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" className="rounded-xl" />
          </div>
          <Button type="submit" className="rounded-full">
            Open shift
          </Button>
        </form>
      </CardContent>
    </Card>
  ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS shifts</h1>
        <p className="text-sm text-muted-foreground">
          Open and close shifts — review recent closeouts and variance history.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/dashboard/pos/cash"
            className="text-primary underline-offset-4 hover:underline"
            data-testid="cashier-shift-flow-link"
          >
            Cashier shift flow (open → assign drawer → count → close → report) →
          </Link>
        </p>
      </div>

      {canCloseShift && closeoutPreviews.length > 0 ? (
        <PosShiftCloseHero previews={closeoutPreviews} />
      ) : null}

      {canCloseShift || canViewShiftHistory ? (
        <PosShiftCloseAttentionStrip focus={shiftCloseFocus} />
      ) : null}

      <PosShiftsCloseoutFlowProofPanel slice={shiftCloseoutFlowProof} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {prioritizeCloseout ? (
          <>
            {closeShiftCard}
            {openShiftCard}
          </>
        ) : (
          <>
            {openShiftCard}
            {closeShiftCard}
          </>
        )}
      </div>

      {canViewShiftHistory ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Recent closeouts</CardTitle>
            <CardDescription>
              {SHIFT_CLOSE_HISTORY_RANGE_LABEL[rangePreset]} — expected vs counted cash with variance
              badges (up to {SHIFT_CLOSE_HISTORY_FILTERED_LIMIT} rows).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PosShiftCloseHistoryPanel
              shifts={closedShiftHistory}
              canExportCsv={canCloseShift}
              rangePreset={rangePreset}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
