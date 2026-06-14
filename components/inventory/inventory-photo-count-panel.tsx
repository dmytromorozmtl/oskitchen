"use client";

import { Camera, Check, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  applyShelfPhotoCountsAction,
  scanShelfPhotoCountAction,
} from "@/actions/inventory/photo-count";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import type { MatchedShelfCountLine, ShelfPhotoCountResult } from "@/lib/inventory/inventory-photo-count-types";

type OpenCount = {
  id: string;
  label: string;
};

type Props = {
  openCounts: OpenCount[];
  aiConfigured: boolean;
};

export function InventoryPhotoCountPanel({ openCounts, aiConfigured }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [applyPending, startApplyTransition] = useTransition();
  const [selectedCountId, setSelectedCountId] = useState(openCounts[0]?.id ?? "");
  const [scan, setScan] = useState<ShelfPhotoCountResult | null>(null);
  const [matched, setMatched] = useState<MatchedShelfCountLine[]>([]);

  function handleFile(file: File) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const res = await invokeServerAction(() => scanShelfPhotoCountAction(fd));
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Shelf scan failed");
        return;
      }
      setScan(res.data.scan);
      setMatched(res.data.matched);
      if (res.data.scan.detections.length === 0) {
        toast.message("No items detected — try a clearer shelf photo.");
      } else {
        toast.success(`Detected ${res.data.scan.detections.length} item(s)`);
      }
    });
  }

  function handleApply() {
    if (!selectedCountId || matched.length === 0) return;
    startApplyTransition(async () => {
      const fd = new FormData();
      fd.set("countId", selectedCountId);
      fd.set("lines", JSON.stringify(matched));
      const res = await invokeServerAction(() => applyShelfPhotoCountsAction(fd));
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Apply failed");
        return;
      }
      toast.success(`Applied ${res.data.appliedCount} line(s) to count`);
    });
  }

  return (
    <Card data-testid="inventory-photo-count-panel">
      <CardHeader>
        <CardTitle className="text-base">AI shelf photo count</CardTitle>
        <CardDescription>
          Photo of shelf → AI counts inventory → apply to an open physical count. MarketMan parity
          for in-house cycle counts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!aiConfigured ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
            OpenAI is not configured — shelf photo AI count requires OPENAI_API_KEY on the server.
          </p>
        ) : null}

        <div className="space-y-2">
          <Label>Open inventory count</Label>
          <Select value={selectedCountId} onValueChange={setSelectedCountId}>
            <SelectTrigger>
              <SelectValue placeholder="Select count" />
            </SelectTrigger>
            <SelectContent>
              {openCounts.length === 0 ? (
                <SelectItem value="__none" disabled>
                  No in-progress counts — start one first
                </SelectItem>
              ) : (
                openCounts.map((count) => (
                  <SelectItem key={count.id} value={count.id}>
                    {count.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="outline"
          disabled={pending || !aiConfigured}
          data-testid="inventory-photo-count-camera-btn"
          onClick={() => inputRef.current?.click()}
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
          {pending ? "Scanning…" : "Take shelf photo"}
        </Button>

        {scan && matched.length > 0 ? (
          <div className="space-y-3">
            {scan.shelfLabel ? (
              <p className="text-sm text-muted-foreground">Shelf: {scan.shelfLabel}</p>
            ) : null}
            <ul className="space-y-2">
              {matched.map((line, index) => (
                <li
                  key={`${line.detectedLabel}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                  data-testid={`inventory-photo-count-line-${index}`}
                >
                  <div>
                    <p className="font-medium">{line.detectedLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.ingredientId ? `Matched: ${line.ingredientName}` : "No ingredient match"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{line.quantity} units</Badge>
                    <Badge variant="outline">{Math.round(line.confidence * 100)}%</Badge>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              disabled={applyPending || !selectedCountId || openCounts.length === 0}
              data-testid="inventory-photo-count-apply-btn"
              onClick={handleApply}
            >
              {applyPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Apply to count
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
