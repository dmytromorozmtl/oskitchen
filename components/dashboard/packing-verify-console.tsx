"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import type { BusinessType, FulfillmentType, OrderStatus } from "@prisma/client";
import { AlertTriangle, Expand, Loader2, Minimize2, ScanLine } from "lucide-react";

import {
  completeVerificationSessionAction,
  getVerificationSessionDetailAction,
  incrementVerifiedQuantityAction,
  markAllergenCheckedAction,
  markLabelCheckedAction,
  searchOrdersByCustomerAction,
  sendVerificationBackToPackingAction,
  setVerificationItemStatusAction,
  startVerificationSessionAction,
  supervisorOverrideVerificationAction,
  verifyItemFullQuantityAction,
} from "@/actions/packing-verification";
import { logPackingEventFormAction, lookupOrderByPackTokenAction } from "@/actions/packing-verify";
import { PackingVerifyQrRegion } from "@/components/dashboard/packing-verify-qr-region";
import { PackingVerifyAttentionStrip } from "@/components/packing-verification/packing-verify-attention-strip";
import { PackingVerifyItemNextAction } from "@/components/packing-verification/packing-verify-item-next-action";
import { PackingVerifySessionNextAction } from "@/components/packing-verification/packing-verify-session-next-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ITEM_STATUS_LABEL, itemStatusTone } from "@/lib/packing-verification/verification-status";
import {
  verificationPageSubtitle,
  verificationPageTitle,
} from "@/lib/packing-verification/verification-terminology";
import {
  buildPackingVerifyFocusSnapshot,
  shouldShowPackingVerifyAttentionStrip,
} from "@/lib/packing-verification/packing-verify-focus-era18";
import type { VerificationSessionDetail } from "@/services/packing-verification/verification-service";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";

type CustomerOrderHit = {
  id: string;
  customerName: string;
  status: string;
  fulfillmentType: string;
};

type LookupPackResult = Awaited<ReturnType<typeof lookupOrderByPackTokenAction>>;
type LoadedOrder = Extract<LookupPackResult, { ok: true }>["order"];

export type VerifyScanRow = {
  id: string;
  token: string;
  tokenType: string;
  source: string;
  success: boolean;
  errorMessage: string | null;
  scannedAt: string;
};

export type VerifyOpenSessionRow = {
  id: string;
  status: string;
  startedAt: string;
  itemCount: number;
  order: { id: string; customerName: string; status: string; fulfillmentType: string } | null;
};

async function flushAction(fn: (fd: FormData) => Promise<unknown>, fd: FormData, router: ReturnType<typeof useRouter>) {
  await invokeServerAction(() => fn(fd));
  router.refresh();
}

function EventBtn({
  orderId,
  orderItemId,
  label,
  eventType,
}: {
  orderId: string;
  orderItemId?: string;
  label: string;
  eventType:
    | "SCANNED"
    | "ITEM_PACKED"
    | "ITEM_MISSING"
    | "ORDER_PACKED"
    | "LABEL_PRINTED"
    | "HANDED_OFF";
}) {
  return (
    <form action={logPackingEventFormAction} className="inline">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="eventType" value={eventType} />
      {orderItemId ? <input type="hidden" name="orderItemId" value={orderItemId} /> : null}
      <Button type="submit" size="sm" variant="outline" className="min-h-10 rounded-full text-xs">
        {label}
      </Button>
    </form>
  );
}

export function PackingVerifyConsole({
  initialToken,
  appOrigin,
  businessType,
  recentScans,
  openSessions,
}: {
  initialToken: string;
  appOrigin: string;
  businessType: BusinessType | null;
  recentScans: VerifyScanRow[];
  openSessions: VerifyOpenSessionRow[];
}) {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [tab, setTab] = React.useState("scan");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [order, setOrder] = React.useState<LoadedOrder | null>(null);
  const [tokenInput, setTokenInput] = React.useState(initialToken);
  const [sessionDetail, setSessionDetail] = React.useState<VerificationSessionDetail | null>(null);
  const [customerQuery, setCustomerQuery] = React.useState("");
  const [customerHits, setCustomerHits] = React.useState<CustomerOrderHit[] | null>(null);
  const [overrideReason, setOverrideReason] = React.useState("");
  const [cameraOff, setCameraOff] = React.useState(false);

  const title = verificationPageTitle(businessType);
  const subtitle = verificationPageSubtitle();

  async function runLookup(e: React.FormEvent | null, source: "MANUAL" | "CAMERA" = "MANUAL") {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("token", tokenInput.trim());
    fd.set("source", source);
    const res = await lookupOrderByPackTokenAction(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setOrder(null);
      setSessionDetail(null);
      setError(getActionError(res) ?? "Something went wrong");
      return;
    }
    if ("ok" in res && res.ok) {
      setOrder(res.order);
      setSessionDetail(null);
      setTab("active");
    }
  }

  async function startSession() {
    if (!order) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("orderId", order.id);
    const res = await startVerificationSessionAction(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(getActionError(res) ?? "Something went wrong");
      return;
    }
    if ("ok" in res && res.ok) {
      const detail = await getVerificationSessionDetailAction(res.sessionId);
      if ("error" in detail && detail.error) setError(getActionError(detail) ?? "Something went wrong");
      else if ("ok" in detail && detail.ok) setSessionDetail(detail.detail);
      router.refresh();
    }
  }

  async function loadSession(id: string) {
    setLoading(true);
    const detail = await getVerificationSessionDetailAction(id);
    setLoading(false);
    if ("error" in detail && detail.error) {
      setError(getActionError(detail) ?? "Something went wrong");
      return;
    }
    if ("ok" in detail && detail.ok) {
      setSessionDetail(detail.detail);
      const o = detail.detail.session.order;
      if (o) {
        setOrder({
          id: o.id,
          customerName: o.customerName,
          status: o.status as OrderStatus,
          fulfillmentType: o.fulfillmentType as FulfillmentType,
          notes: o.notes,
          pickupDate: null,
          brandId: o.brandId,
          publicLookupToken: null,
          items: detail.detail.items.map((i) => ({
            id: i.id,
            quantity: i.expectedQuantity,
            title: i.title,
            allergens: i.productAllergens,
          })),
          events: [],
        });
      }
      setTab("active");
    }
  }

  async function runCustomerSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("query", customerQuery.trim());
    const res = await searchOrdersByCustomerAction(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setCustomerHits(null);
      setError(getActionError(res) ?? "Something went wrong");
      return;
    }
    if ("ok" in res && res.ok) {
      setCustomerHits(
        res.orders.map((o) => ({
          id: o.id,
          customerName: o.customerName ?? "Customer",
          status: o.status,
          fulfillmentType: o.fulfillmentType,
        })),
      );
    }
  }

  function toggleFs() {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen().catch(() => setError("Fullscreen unavailable."));
  }

  const scanUrl =
    order?.publicLookupToken &&
    `${appOrigin.replace(/\/$/, "")}/dashboard/packing/verify?t=${encodeURIComponent(order.publicLookupToken)}`;

  const issueItems =
    sessionDetail?.items.filter((i) => ["MISSING", "WRONG_ITEM", "DAMAGED", "EXTRA"].includes(i.status)) ?? [];

  const openSessionFocus = React.useMemo(
    () =>
      openSessions.map((session) => ({
        id: session.id,
        status: session.status,
        itemCount: session.itemCount,
        customerName: session.order?.customerName ?? null,
        startedAt: session.startedAt,
      })),
    [openSessions],
  );

  const sessionItemFocus = React.useMemo(
    () =>
      sessionDetail?.items.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        allergenCheckStatus: item.allergenCheckStatus,
        labelCheckStatus: item.labelCheckStatus,
        expectedQuantity: item.expectedQuantity,
        verifiedQuantity: item.verifiedQuantity,
      })) ?? [],
    [sessionDetail],
  );

  const verifyFocus = React.useMemo(
    () =>
      buildPackingVerifyFocusSnapshot(
        openSessionFocus,
        recentScans.map((scan) => ({ success: scan.success })),
        sessionItemFocus,
      ),
    [openSessionFocus, recentScans, sessionItemFocus],
  );

  const showVerifyAttentionStrip = shouldShowPackingVerifyAttentionStrip(verifyFocus);

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => void toggleFs()}>
            {typeof document !== "undefined" && document.fullscreenElement ? (
              <>
                <Minimize2 className="mr-2 h-4 w-4" /> Exit fullscreen
              </>
            ) : (
              <>
                <Expand className="mr-2 h-4 w-4" /> Station fullscreen
              </>
            )}
          </Button>
          <Button asChild variant="secondary" className="min-h-11 rounded-full">
            <Link href="/dashboard/packing">Packing & labels</Link>
          </Button>
          <Button asChild variant="secondary" className="min-h-11 rounded-full">
            <Link href="/dashboard/order-hub">Order hub</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </CardTitle>
            <CardDescription>Fix the token or ask a manager if permissions block you.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {showVerifyAttentionStrip ? (
        <PackingVerifyAttentionStrip
          focus={verifyFocus}
          openSessions={openSessionFocus}
          sessionItems={sessionItemFocus}
          onTabChange={setTab}
        />
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex h-auto min-h-12 flex-wrap justify-start gap-1 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="scan" className="rounded-xl px-3 py-2 text-sm">
            <ScanLine className="mr-1 inline h-4 w-4" />
            Scan
          </TabsTrigger>
          <TabsTrigger value="manual" className="rounded-xl px-3 py-2 text-sm">
            Manual lookup
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl px-3 py-2 text-sm">
            Active session
          </TabsTrigger>
          <TabsTrigger value="waves" className="rounded-xl px-3 py-2 text-sm">
            Waves
          </TabsTrigger>
          <TabsTrigger value="routes" className="rounded-xl px-3 py-2 text-sm">
            Routes
          </TabsTrigger>
          <TabsTrigger value="issues" className="rounded-xl px-3 py-2 text-sm">
            Issues
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl px-3 py-2 text-sm">
            Audit trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4 space-y-4" id="packing-verify-scan">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Camera scan</CardTitle>
              <CardDescription>QR with guest URL or raw token. Data stays in your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameraOff ? (
                <p className="text-sm text-muted-foreground">Camera off — use Manual tab.</p>
              ) : (
                <PackingVerifyQrRegion
                  disabled={loading}
                  onDecoded={(t) => {
                    setTokenInput(t);
                    void runLookup(null, "CAMERA");
                  }}
                />
              )}
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setCameraOff((v) => !v)}>
                {cameraOff ? "Enable camera" : "Disable camera"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token or order id</CardTitle>
              <CardDescription>Guest lookup token or order UUID.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void runLookup(e, "MANUAL")} className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="token">Lookup token</Label>
                  <Input
                    id="token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Token or UUID"
                    autoComplete="off"
                    className="min-h-11 rounded-xl"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading} className="min-h-11 w-full rounded-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load order"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer name</CardTitle>
              <CardDescription>Search Confirmed / Preparing / Ready orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void runCustomerSearch(e)} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Two+ characters"
                  className="min-h-11 flex-1 rounded-xl"
                />
                <Button type="submit" disabled={loading} variant="secondary" className="min-h-11 rounded-full">
                  Search
                </Button>
              </form>
              {customerHits?.length ? (
                <ul className="mt-4 space-y-2">
                  {customerHits.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                      <div>
                        <p className="font-medium">{o.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.status} · {o.fulfillmentType}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setTokenInput(o.id);
                          void runLookup(null, "MANUAL");
                        }}
                      >
                        Load
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-4">
          <Card id="packing-verify-open-sessions">
            <CardHeader>
              <CardTitle className="text-lg">Open sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {openSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open sessions.</p>
              ) : (
                openSessions.map((s) => (
                  <div
                    key={s.id}
                    id={`packing-verify-session-${s.id}`}
                    className="scroll-mt-24 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-medium">{s.order?.customerName ?? "Order"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.status} · {s.itemCount} lines · {new Date(s.startedAt).toLocaleString()}
                      </p>
                      <PackingVerifySessionNextAction
                        session={{
                          id: s.id,
                          status: s.status,
                          itemCount: s.itemCount,
                          customerName: s.order?.customerName ?? null,
                          startedAt: s.startedAt,
                        }}
                        onResume={(sessionId) => void loadSession(sessionId)}
                      />
                    </div>
                    <Button type="button" variant="secondary" className="rounded-full" onClick={() => void loadSession(s.id)}>
                      Resume
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {order ? (
            <>
              <Card className="border-amber-500/40 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Allergen & nutrition</CardTitle>
                  <CardDescription>Operators must verify catalog data — OS Kitchen does not certify compliance.</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{order.customerName}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="outline" className="rounded-full">
                        {order.status}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {order.fulfillmentType}
                      </Badge>
                    </CardDescription>
                    {order.notes ? <p className="mt-2 text-sm text-muted-foreground">Notes: {order.notes}</p> : null}
                  </div>
                  {scanUrl ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border bg-background p-3">
                      <QRCodeSVG value={scanUrl} size={112} />
                      <span className="text-xs text-muted-foreground">Staff QR</span>
                    </div>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  {!sessionDetail && order.items.length > 0 ? (
                    <ul className="mb-4 space-y-2 border-b pb-4">
                      {order.items.map((i) => (
                        <li
                          key={i.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                        >
                          <span>
                            {i.quantity}× {i.title}
                          </span>
                          <span className="flex flex-wrap gap-2">
                            <EventBtn orderId={order.id} orderItemId={i.id} label="Packed" eventType="ITEM_PACKED" />
                            <EventBtn orderId={order.id} orderItemId={i.id} label="Missing" eventType="ITEM_MISSING" />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {!sessionDetail ? (
                    <Button type="button" variant="premium" className="min-h-12 rounded-full" onClick={() => void startSession()}>
                      Start verification session
                    </Button>
                  ) : null}

                  {sessionDetail ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{sessionDetail.session.status}</Badge>
                        <Badge variant="outline">{sessionDetail.session.mode.replace(/_/g, " ")}</Badge>
                      </div>
                      <ul className="space-y-3">
                        {sessionDetail.items.map((i) => (
                          <li key={i.id} id={`packing-verify-item-${i.id}`} className="scroll-mt-24 rounded-xl border p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant={itemStatusTone(i.status)}>{ITEM_STATUS_LABEL[i.status]}</Badge>
                                  {i.allergenCheckStatus === "PENDING" ? (
                                    <Badge className="bg-amber-600 hover:bg-amber-600">Allergen</Badge>
                                  ) : null}
                                  {i.labelCheckStatus === "PENDING" ? <Badge variant="outline">Label</Badge> : null}
                                </div>
                                <p className="text-base font-semibold">
                                  {i.title}{" "}
                                  <span className="text-muted-foreground">
                                    ({i.verifiedQuantity}/{i.expectedQuantity})
                                  </span>
                                </p>
                                <PackingVerifyItemNextAction
                                  item={{
                                    id: i.id,
                                    title: i.title,
                                    status: i.status,
                                    allergenCheckStatus: i.allergenCheckStatus,
                                    labelCheckStatus: i.labelCheckStatus,
                                    expectedQuantity: i.expectedQuantity,
                                    verifiedQuantity: i.verifiedQuantity,
                                  }}
                                />
                                {i.productAllergens?.trim() ? (
                                  <p className="text-xs text-amber-900 dark:text-amber-100">Allergens: {i.productAllergens}</p>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <form action={(fd) => flushAction(incrementVerifiedQuantityAction, fd, router)}>
                                  <input type="hidden" name="itemId" value={i.id} />
                                  <Button type="submit" variant="secondary" className="min-h-11 min-w-[3rem] rounded-full text-lg">
                                    +1
                                  </Button>
                                </form>
                                <form action={(fd) => flushAction(verifyItemFullQuantityAction, fd, router)}>
                                  <input type="hidden" name="itemId" value={i.id} />
                                  <Button type="submit" className="min-h-11 rounded-full">
                                    Verify all
                                  </Button>
                                </form>
                                <form action={(fd) => flushAction(markAllergenCheckedAction, fd, router)}>
                                  <input type="hidden" name="itemId" value={i.id} />
                                  <Button type="submit" variant="outline" className="min-h-11 rounded-full" disabled={i.allergenCheckStatus !== "PENDING"}>
                                    Allergen OK
                                  </Button>
                                </form>
                                <form action={(fd) => flushAction(markLabelCheckedAction, fd, router)}>
                                  <input type="hidden" name="itemId" value={i.id} />
                                  <Button type="submit" variant="outline" className="min-h-11 rounded-full" disabled={i.labelCheckStatus !== "PENDING"}>
                                    Label OK
                                  </Button>
                                </form>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                              {(["MISSING", "WRONG_ITEM", "DAMAGED", "EXTRA"] as const).map((st) => (
                                <form key={st} action={(fd) => flushAction(setVerificationItemStatusAction, fd, router)}>
                                  <input type="hidden" name="itemId" value={i.id} />
                                  <input type="hidden" name="status" value={st} />
                                  <Button type="submit" variant="outline" size="sm" className="min-h-10 rounded-full capitalize">
                                    {ITEM_STATUS_LABEL[st]}
                                  </Button>
                                </form>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
                        <p className="text-sm font-medium">Complete</p>
                        <div className="flex flex-wrap gap-2">
                          <form action={(fd) => flushAction(completeVerificationSessionAction, fd, router)}>
                            <input type="hidden" name="sessionId" value={sessionDetail.session.id} />
                            <input type="hidden" name="outcome" value="pass" />
                            <Button type="submit" variant="premium" className="min-h-12 rounded-full">
                              Pass
                            </Button>
                          </form>
                          <form action={(fd) => flushAction(completeVerificationSessionAction, fd, router)}>
                            <input type="hidden" name="sessionId" value={sessionDetail.session.id} />
                            <input type="hidden" name="outcome" value="partial" />
                            <Button type="submit" variant="secondary" className="min-h-12 rounded-full">
                              Partial
                            </Button>
                          </form>
                          <form action={(fd) => flushAction(completeVerificationSessionAction, fd, router)}>
                            <input type="hidden" name="sessionId" value={sessionDetail.session.id} />
                            <input type="hidden" name="outcome" value="fail" />
                            <Button type="submit" variant="destructive" className="min-h-12 rounded-full">
                              Fail
                            </Button>
                          </form>
                          <form action={(fd) => flushAction(sendVerificationBackToPackingAction, fd, router)}>
                            <input type="hidden" name="sessionId" value={sessionDetail.session.id} />
                            <Button type="submit" variant="outline" className="min-h-12 rounded-full">
                              Back to packing
                            </Button>
                          </form>
                        </div>
                        <div className="mt-2 space-y-2">
                          <Label htmlFor="override">Supervisor override</Label>
                          <Textarea
                            id="override"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Reason (owner / platform)"
                            className="min-h-[72px] rounded-xl"
                          />
                          <form
                            onSubmit={async (event) => {
                              event.preventDefault();
                              const fd = new FormData(event.currentTarget);
                              fd.set("reason", overrideReason);
                              await flushAction(supervisorOverrideVerificationAction, fd, router);
                              setOverrideReason("");
                              router.refresh();
                            }}
                          >
                            <input type="hidden" name="sessionId" value={sessionDetail.session.id} />
                            <Button type="submit" variant="outline" className="min-h-11 rounded-full">
                              Override
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium">Legacy packing events</p>
                    <div className="flex flex-wrap gap-2">
                      <EventBtn orderId={order.id} label="Order packed" eventType="ORDER_PACKED" />
                      <EventBtn orderId={order.id} label="Handoff" eventType="HANDED_OFF" />
                      <EventBtn orderId={order.id} label="Scanned" eventType="SCANNED" />
                    </div>
                  </div>

                  {order.events.length > 0 ? (
                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Recent packing events</p>
                      <ul className="mt-2 space-y-1">
                        {order.events.map((ev) => (
                          <li key={ev.id}>
                            {ev.eventType}
                            {ev.notes ? ` — ${ev.notes}` : ""}{" "}
                            <span className="opacity-70">({new Date(ev.createdAt).toLocaleString()})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="waves" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Waves</CardTitle>
              <CardDescription>Wave batch verification ties to Packing command center (next).</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/packing">Packing & labels</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Routes</CardTitle>
              <CardDescription>Driver manifest checks ship in a follow-up.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/dashboard/order-hub">Order hub</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-4" id="packing-verify-issues">
          <Card>
            <CardHeader>
              <CardTitle>Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {!sessionDetail ? (
                <p className="text-sm text-muted-foreground">Resume a session first.</p>
              ) : issueItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No flagged lines.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {issueItems.map((i) => (
                    <li key={i.id} className="rounded-lg border px-3 py-2">
                      {i.title} — {ITEM_STATUS_LABEL[i.status]}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QC timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {!sessionDetail?.timeline.length ? (
                <p className="text-sm text-muted-foreground">No QC events for this session.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {sessionDetail.timeline.map((ev) => (
                    <li key={ev.id} className="rounded-lg border px-3 py-2">
                      <span className="font-medium">{ev.eventType.replace(/_/g, " ")}</span>
                      <span className="ml-2 text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent scans</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet.</p>
              ) : (
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {recentScans.map((s) => (
                    <li key={s.id} className="flex flex-wrap justify-between gap-2 rounded border px-2 py-1">
                      <span className={s.success ? "text-foreground" : "text-destructive"}>
                        {s.success ? "OK" : "Fail"} · {s.tokenType}
                      </span>
                      <span>{new Date(s.scannedAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
