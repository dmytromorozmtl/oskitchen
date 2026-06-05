"use client";

import {
  Camera,
  Check,
  CloudOff,
  History,
  ImageIcon,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  confirmInvoiceScanAction,
  scanInvoiceAction,
} from "@/actions/inventory/invoice-scanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import {
  base64ToBlob,
  enqueueOfflineInvoiceConfirm,
  enqueueOfflineInvoiceScan,
  fileToBase64,
  invoiceScanQueueSize,
  listInvoiceScanQueue,
  removeInvoiceScanQueueEntry,
  updateInvoiceScanQueueEntry,
} from "@/lib/inventory/invoice-scanner-offline-queue";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  InvoiceScanHistoryEntry,
  ScannedInvoice,
  ScannedInvoiceLineItem,
} from "@/lib/inventory/invoice-scanner-types";
import { confidenceBadgeVariant } from "@/lib/inventory/invoice-scanner-types";

type Props = {
  history: InvoiceScanHistoryEntry[];
  aiConfigured: boolean;
};

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <Badge variant={confidenceBadgeVariant(value)} className="tabular-nums">
      {pct}%
    </Badge>
  );
}

function LineItemEditor({
  line,
  index,
  onChange,
}: {
  line: ScannedInvoiceLineItem;
  index: number;
  onChange: (index: number, patch: Partial<ScannedInvoiceLineItem>) => void;
}) {
  return (
    <div
      className="rounded-lg border bg-background p-3 space-y-2"
      data-testid={`invoice-scan-line-${index}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium">Line {index + 1}</p>
        <ConfidenceBadge value={line.confidence} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`line-name-${index}`} className="text-xs">
            Item name
          </Label>
          <Input
            id={`line-name-${index}`}
            value={line.name}
            onChange={(e) => onChange(index, { name: e.target.value })}
            className="h-10 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`line-qty-${index}`} className="text-xs">
            Qty
          </Label>
          <Input
            id={`line-qty-${index}`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={line.quantity}
            onChange={(e) => onChange(index, { quantity: Number(e.target.value) || 0 })}
            className="h-10 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`line-unit-${index}`} className="text-xs">
            Unit
          </Label>
          <Input
            id={`line-unit-${index}`}
            value={line.unit}
            onChange={(e) => onChange(index, { unit: e.target.value })}
            className="h-10 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`line-price-${index}`} className="text-xs">
            Unit price
          </Label>
          <Input
            id={`line-price-${index}`}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={line.unitPrice}
            onChange={(e) => {
              const unitPrice = Number(e.target.value) || 0;
              onChange(index, { unitPrice, total: unitPrice * line.quantity });
            }}
            className="h-10 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Total</Label>
          <p className="flex h-10 items-center text-sm font-medium tabular-nums sm:h-9">
            {formatCurrency(line.total)}
          </p>
        </div>
      </div>
      {line.matchedIngredientName ? (
        <p className="text-xs text-muted-foreground">
          Matched inventory: {line.matchedIngredientName}
        </p>
      ) : (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          No inventory match — a new ingredient will be created on confirm.
        </p>
      )}
    </div>
  );
}

function CameraViewfinder({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;
    void navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => {
        toast.error("Camera unavailable — use gallery instead.");
        onClose();
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [onClose]);

  function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `invoice-${Date.now()}.jpg`, { type: "image/jpeg" }));
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      data-testid="invoice-scan-viewfinder"
    >
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="aspect-[3/4] w-full max-w-sm rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>
        <p className="absolute bottom-24 left-0 right-0 text-center text-sm text-white/90">
          Align invoice inside the frame
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 bg-black/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white"
          data-testid="invoice-scan-viewfinder-close"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <button
          type="button"
          data-testid="invoice-scan-shutter-btn"
          onClick={captureFrame}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20"
          aria-label="Capture invoice photo"
        >
          <span className="block h-12 w-12 rounded-full bg-white" />
        </button>
        <div className="w-10" />
      </div>
    </div>
  );
}

export function InvoiceScannerMobile({ history, aiConfigured }: Props) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [draft, setDraft] = useState<ScannedInvoice | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const refreshQueueCount = useCallback(async () => {
    const size = await invoiceScanQueueSize();
    setQueueCount(size);
  }, []);

  const processScanFile = useCallback(
    async (file: File) => {
      setScanning(true);
      setPreviewUrl(URL.createObjectURL(file));

      if (!navigator.onLine) {
        const imageBase64 = await fileToBase64(file);
        await enqueueOfflineInvoiceScan({
          imageBase64,
          mimeType: file.type || "image/jpeg",
          fileName: file.name,
        });
        await refreshQueueCount();
        setScanning(false);
        toast.info("Saved offline — invoice will scan when you reconnect.");
        return;
      }

      const fd = new FormData();
      fd.set("file", file);
      const result = await invokeServerAction(() => scanInvoiceAction(fd));
      setScanning(false);

      const err = getActionError(result);
      if (err) {
        toast.error(err);
        return;
      }
      if (isActionSuccess(result) && result.data.scanned) {
        setDraft(result.data.scanned);
        toast.success("Invoice scanned — review fields before confirming.");
      }
    },
    [refreshQueueCount],
  );

  const flushOfflineQueue = useCallback(async () => {
    if (!navigator.onLine || syncingQueue) return;
    const entries = await listInvoiceScanQueue();
    const pendingEntries = entries.filter((e) => e.status === "queued" || e.status === "failed");
    if (pendingEntries.length === 0) return;

    setSyncingQueue(true);
    let synced = 0;

    for (const entry of pendingEntries) {
      await updateInvoiceScanQueueEntry(entry.id, { status: "syncing", syncError: undefined });
      try {
        if (entry.kind === "scan" && entry.imageBase64 && entry.mimeType) {
          const blob = base64ToBlob(entry.imageBase64, entry.mimeType);
          const file = new File(
            [blob],
            entry.fileName ?? `offline-invoice-${entry.id}.jpg`,
            { type: entry.mimeType },
          );
          const fd = new FormData();
          fd.set("file", file);
          const result = await invokeServerAction(() => scanInvoiceAction(fd));
          const err = getActionError(result);
          if (err) throw new Error(err);
          if (isActionSuccess(result) && result.data.scanned) {
            setDraft(result.data.scanned);
            setPreviewUrl(URL.createObjectURL(file));
            synced += 1;
          }
        } else if (entry.kind === "confirm" && entry.confirmPayload) {
          const result = await invokeServerAction(() =>
            confirmInvoiceScanAction(entry.confirmPayload!),
          );
          const err = getActionError(result);
          if (err) throw new Error(err);
          synced += 1;
        }
        await removeInvoiceScanQueueEntry(entry.id);
      } catch (err) {
        await updateInvoiceScanQueueEntry(entry.id, {
          status: "failed",
          syncError: err instanceof Error ? err.message : "Sync failed",
        });
      }
    }

    await refreshQueueCount();
    setSyncingQueue(false);
    if (synced > 0) {
      toast.success(`Synced ${synced} offline invoice item${synced === 1 ? "" : "s"}.`);
    }
  }, [refreshQueueCount, syncingQueue]);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    void refreshQueueCount();

    function handleOnline() {
      setOnline(true);
      void flushOfflineQueue();
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushOfflineQueue, refreshQueueCount]);

  function updateDraftField(field: keyof ScannedInvoice, value: string | number) {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  }

  function updateLine(index: number, patch: Partial<ScannedInvoiceLineItem>) {
    if (!draft) return;
    setDraft({
      ...draft,
      lineItems: draft.lineItems.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    });
  }

  function confirmSupply() {
    if (!draft) return;
    startTransition(async () => {
      if (!navigator.onLine) {
        await enqueueOfflineInvoiceConfirm(draft);
        await refreshQueueCount();
        toast.info("Supply saved offline — will create when you reconnect.");
        setDraft(null);
        setPreviewUrl(null);
        return;
      }

      const result = await invokeServerAction(() => confirmInvoiceScanAction(draft));
      const err = getActionError(result);
      if (err) {
        toast.error(err);
        return;
      }
      if (isActionSuccess(result)) {
        toast.success(
          `Supply created — PO ${result.data.orderNumber}, ${result.data.linesReceived} line(s) received.`,
        );
        setDraft(null);
        setPreviewUrl(null);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="invoice-scanner-panel">
      {!online || queueCount > 0 ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/60 bg-amber-50/80 px-3 py-2 text-sm dark:bg-amber-950/30"
          data-testid="invoice-scan-offline-banner"
        >
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <CloudOff className="h-4 w-4 shrink-0" />
            {!online ? (
              <span>Offline — photos queue locally and sync when connected.</span>
            ) : (
              <span>{queueCount} item{queueCount === 1 ? "" : "s"} waiting to sync.</span>
            )}
          </div>
          {online && queueCount > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="invoice-scan-sync-queue-btn"
              disabled={syncingQueue}
              onClick={() => void flushOfflineQueue()}
            >
              {syncingQueue ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-3 w-3" />
              )}
              Sync now
            </Button>
          ) : null}
        </div>
      ) : null}

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">AI-assisted invoice scanning</CardTitle>
          <CardDescription>
            {aiConfigured
              ? "Photograph a supplier invoice to auto-fill a supply receipt. Please verify all fields before confirming."
              : "Set OPENAI_API_KEY on the server to enable vision scanning."}
          </CardDescription>
        </CardHeader>
        {draft ? (
          <CardContent>
            <p className="text-sm">
              Overall confidence: <ConfidenceBadge value={draft.confidence} />
            </p>
          </CardContent>
        ) : null}
      </Card>

      {!draft ? (
        <div className="space-y-4">
          <button
            type="button"
            data-testid="invoice-scan-camera-btn"
            onClick={() => setCameraOpen(true)}
            disabled={scanning}
            className={cn(
              "flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 p-8 text-center transition active:scale-[0.99] hover:bg-primary/10",
              scanning && "opacity-60",
            )}
          >
            {scanning ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="text-base font-medium">AI is reading your invoice…</span>
              </>
            ) : (
              <>
                <Camera className="h-14 w-14 text-primary" />
                <span className="text-xl font-semibold">Take Photo</span>
                <span className="text-sm text-muted-foreground">Thumb-friendly · opens camera viewfinder</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="invoice-scan-gallery-btn"
            onClick={() => galleryInputRef.current?.click()}
            disabled={scanning}
            className="flex w-full items-center justify-center gap-3 rounded-xl border bg-muted/30 px-4 py-4 text-base font-medium transition hover:bg-muted/50 active:scale-[0.99]"
          >
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            Choose from gallery
          </button>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void processScanFile(file);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="space-y-4 pb-28">
          {previewUrl ? (
            <div className="overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Scanned invoice preview"
                className="max-h-56 w-full object-contain bg-muted/20"
              />
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review extracted invoice</CardTitle>
              <CardDescription>
                AI-assisted invoice scanning. Please verify all fields before confirming.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[50vh] space-y-4 overflow-y-auto">
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="scan-supplier">Supplier</Label>
                  <Input
                    id="scan-supplier"
                    value={draft.supplier}
                    onChange={(e) => updateDraftField("supplier", e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="scan-invoice-number">Invoice #</Label>
                  <Input
                    id="scan-invoice-number"
                    value={draft.invoiceNumber}
                    onChange={(e) => updateDraftField("invoiceNumber", e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="scan-date">Invoice date</Label>
                    <Input
                      id="scan-date"
                      type="date"
                      value={draft.date}
                      onChange={(e) => updateDraftField("date", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="scan-due">Due date</Label>
                    <Input
                      id="scan-due"
                      type="date"
                      value={draft.dueDate}
                      onChange={(e) => updateDraftField("dueDate", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Line items</p>
                {draft.lineItems.map((line, index) => (
                  <LineItemEditor
                    key={`${line.name}-${index}`}
                    line={line}
                    index={index}
                    onChange={updateLine}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-4 border-t pt-3 text-sm tabular-nums">
                <span>Subtotal: {formatCurrency(draft.subtotal)}</span>
                <span>Tax: {formatCurrency(draft.tax)}</span>
                <span className="font-semibold">Total: {formatCurrency(draft.total)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur">
            <div className="mx-auto flex max-w-3xl gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-12"
                onClick={() => {
                  setDraft(null);
                  setPreviewUrl(null);
                }}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                data-testid="invoice-scan-confirm-btn"
                className="h-12 flex-1 text-base"
                onClick={confirmSupply}
                disabled={pending || draft.lineItems.length === 0}
              >
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Confirm All
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Scan history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scanned invoices yet.</p>
          ) : (
            <ul className="divide-y" data-testid="invoice-scan-history">
              {history.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {entry.supplier} · #{entry.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.scannedAt).toLocaleString()} · {formatCurrency(entry.total)}
                    </p>
                  </div>
                  <ConfidenceBadge value={entry.confidence} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {cameraOpen ? (
        <CameraViewfinder
          onCapture={(file) => void processScanFile(file)}
          onClose={() => setCameraOpen(false)}
        />
      ) : null}
    </div>
  );
}
