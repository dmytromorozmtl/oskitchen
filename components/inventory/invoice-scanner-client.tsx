"use client";

import { Camera, Check, History, Loader2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
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
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  InvoiceScanHistoryEntry,
  ScannedInvoice,
  ScannedInvoiceLineItem,
} from "@/services/ai/invoice-scanner-service";
import { confidenceBadgeVariant } from "@/services/ai/invoice-scanner-service";

type Props = {
  history: InvoiceScanHistoryEntry[];
  aiConfigured: boolean;
};

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const variant = confidenceBadgeVariant(value);
  return (
    <Badge variant={variant} className="tabular-nums">
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
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`line-qty-${index}`} className="text-xs">
            Qty
          </Label>
          <Input
            id={`line-qty-${index}`}
            type="number"
            min={0}
            step="any"
            value={line.quantity}
            onChange={(e) => onChange(index, { quantity: Number(e.target.value) || 0 })}
            className="h-9"
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
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`line-price-${index}`} className="text-xs">
            Unit price
          </Label>
          <Input
            id={`line-price-${index}`}
            type="number"
            min={0}
            step="0.01"
            value={line.unitPrice}
            onChange={(e) => {
              const unitPrice = Number(e.target.value) || 0;
              onChange(index, {
                unitPrice,
                total: unitPrice * line.quantity,
              });
            }}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Total</Label>
          <p className="h-9 flex items-center text-sm font-medium tabular-nums">
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

export function InvoiceScannerClient({ history, aiConfigured }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState<ScannedInvoice | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setScanning(true);
    setPreviewUrl(URL.createObjectURL(file));

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
  }

  function updateDraftField(field: keyof ScannedInvoice, value: string | number) {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  }

  function updateLine(index: number, patch: Partial<ScannedInvoiceLineItem>) {
    if (!draft) return;
    const lineItems = draft.lineItems.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    setDraft({ ...draft, lineItems });
  }

  function confirmSupply() {
    if (!draft) return;
    startTransition(async () => {
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
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">AI-assisted invoice scanning</CardTitle>
          <CardDescription>
            {aiConfigured
              ? "Photograph a supplier invoice to auto-fill a supply receipt. Please verify all fields before confirming."
              : "Set OPENAI_API_KEY on the server to enable vision scanning. You can still enter supply data manually after upload."}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            data-testid="invoice-scan-camera-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className={cn(
              "flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition hover:bg-primary/10",
              scanning && "opacity-60",
            )}
          >
            {scanning ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="text-sm font-medium">AI is reading your invoice…</span>
              </>
            ) : (
              <>
                <Camera className="h-10 w-10 text-primary" />
                <span className="text-base font-semibold">Take Photo</span>
                <span className="text-xs text-muted-foreground">Use camera on mobile</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="invoice-scan-gallery-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/30 p-6 text-center transition hover:bg-muted/50"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-base font-semibold">Choose from gallery</span>
            <span className="text-xs text-muted-foreground">JPEG or PNG invoice photo</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileSelected(file);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {previewUrl ? (
            <div className="overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Scanned invoice preview"
                className="max-h-48 w-full object-contain bg-muted/20"
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
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="scan-supplier">Supplier</Label>
                  <Input
                    id="scan-supplier"
                    value={draft.supplier}
                    onChange={(e) => updateDraftField("supplier", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="scan-invoice-number">Invoice #</Label>
                  <Input
                    id="scan-invoice-number"
                    value={draft.invoiceNumber}
                    onChange={(e) => updateDraftField("invoiceNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="scan-date">Invoice date</Label>
                  <Input
                    id="scan-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => updateDraftField("date", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="scan-due">Due date</Label>
                  <Input
                    id="scan-due"
                    type="date"
                    value={draft.dueDate}
                    onChange={(e) => updateDraftField("dueDate", e.target.value)}
                  />
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

              <div className="flex flex-wrap gap-4 text-sm tabular-nums border-t pt-3">
                <span>Subtotal: {formatCurrency(draft.subtotal)}</span>
                <span>Tax: {formatCurrency(draft.tax)}</span>
                <span className="font-semibold">Total: {formatCurrency(draft.total)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 z-10 flex flex-wrap gap-2 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
            <Button
              type="button"
              variant="outline"
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
              className="flex-1 sm:flex-none"
              onClick={confirmSupply}
              disabled={pending || draft.lineItems.length === 0}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Confirm &amp; Create Supply
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Scan history
          </CardTitle>
          <CardDescription>Recent invoices processed through the scanner.</CardDescription>
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
    </div>
  );
}
