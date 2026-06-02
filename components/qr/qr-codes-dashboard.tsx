"use client";

import * as React from "react";
import { Download, Printer, QrCode } from "lucide-react";
import { toast } from "sonner";

import {
  createQrTableAction,
  generateQrCodeAction,
  listQrTablesAction,
} from "@/actions/qr-codes";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import { publicQrOrderPath } from "@/lib/qr/qr-order-meta";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TableRow = {
  id: string;
  name: string;
  section: string | null;
};

type QrCache = Record<string, { url: string; qrDataUrl: string }>;

export function QrCodesDashboard({
  initialStoreSlug,
  initialTables,
}: {
  initialStoreSlug: string | null;
  initialTables: TableRow[];
}) {
  const [storeSlug, setStoreSlug] = React.useState(initialStoreSlug ?? "");
  const [tables, setTables] = React.useState(initialTables);
  const [qrByTable, setQrByTable] = React.useState<QrCache>({});
  const [newTableName, setNewTableName] = React.useState("");
  const [pending, setPending] = React.useState<string | null>(null);

  async function refreshTables() {
    const res = await invokeServerAction(() => listQrTablesAction());
    if (isActionSuccess<{ tables: TableRow[]; storeSlug: string | null }>(res)) {
      setTables(res.data.tables);
      if (res.data.storeSlug) setStoreSlug(res.data.storeSlug);
    }
  }

  async function generateForTable(tableRouteId: string) {
    if (!storeSlug) {
      toast.error("Publish a storefront with a store slug first.");
      return;
    }
    setPending(tableRouteId);
    const res = await invokeServerAction(() =>
      generateQrCodeAction({ storeSlug, tableRouteId }),
    );
    setPending(null);
    if (!isActionSuccess<{ url: string; qrDataUrl: string }>(res)) {
      toast.error(getActionError(res) ?? "QR generation failed");
      return;
    }
    setQrByTable((prev) => ({
      ...prev,
      [tableRouteId]: { url: res.data.url, qrDataUrl: res.data.qrDataUrl },
    }));
  }

  async function generateAll() {
    for (const t of tables) {
      await generateForTable(t.name);
    }
  }

  function downloadPng(tableRouteId: string) {
    const qr = qrByTable[tableRouteId];
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr.qrDataUrl;
    a.download = `qr-${storeSlug}-table-${tableRouteId}.png`;
    a.click();
  }

  function printAll() {
    const entries = tables
      .map((t) => ({ table: t, qr: qrByTable[t.name] }))
      .filter((e) => e.qr);
    if (!entries.length) {
      toast.error("Generate QR codes first.");
      return;
    }
    const html = entries
      .map(
        (e) => `
      <section style="page-break-after:always;text-align:center;padding:24px;font-family:system-ui">
        <h2 style="margin:0 0 8px">${e.table.name}</h2>
        <p style="color:#666;margin:0 0 16px">${e.qr!.url}</p>
        <img src="${e.qr!.qrDataUrl}" width="280" height="280" alt="QR" />
      </section>`,
      )
      .join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  async function addTable() {
    const name = newTableName.trim();
    if (!name) return;
    const res = await invokeServerAction(() => createQrTableAction({ name }));
    if (!isActionSuccess(res)) {
      toast.error(getActionError(res) ?? "Could not add table");
      return;
    }
    setNewTableName("");
    await refreshTables();
    toast.success(`Table ${name} added`);
  }

  return (
    <div className="space-y-8">
      {!storeSlug ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Publish your storefront first</CardTitle>
            <CardDescription>
              QR links use your published store slug. Enable storefront ordering, then return here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Guest URL pattern:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            /q/{storeSlug}/[table]
          </code>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add table</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <div className="flex-1 space-y-2 min-w-[200px]">
            <Label htmlFor="tableName">Table name / number</Label>
            <Input
              id="tableName"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="12"
              className="rounded-full"
            />
          </div>
          <Button type="button" className="mt-8 rounded-full" onClick={() => void addTable()}>
            Add table
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={!tables.length || !storeSlug}
          onClick={() => void generateAll()}
        >
          <QrCode className="mr-2 h-4 w-4" />
          Generate all
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={printAll}
          data-testid="qr-print-all"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print all
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="qr-table-grid">
        {tables.map((table) => {
          const routeId = table.name;
          const qr = qrByTable[routeId];
          const guestPath = storeSlug ? publicQrOrderPath(storeSlug, routeId) : null;
          return (
            <Card key={table.id} className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{table.name}</CardTitle>
                {table.section ? (
                  <CardDescription>{table.section}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                {qr ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qr.qrDataUrl}
                      alt={`QR for table ${table.name}`}
                      width={160}
                      height={160}
                      className="rounded-lg border"
                    />
                    <p className="max-w-full truncate text-xs text-muted-foreground">{qr.url}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No QR generated yet</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full"
                    disabled={!storeSlug || pending === routeId}
                    onClick={() => void generateForTable(routeId)}
                  >
                    {pending === routeId ? "…" : "Generate QR"}
                  </Button>
                  {qr ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => downloadPng(routeId)}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      PNG
                    </Button>
                  ) : null}
                  {guestPath ? (
                    <Button size="sm" variant="ghost" className="rounded-full" asChild>
                      <a href={guestPath} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tables.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Add tables above to generate QR codes for dine-in ordering.
        </p>
      ) : null}
    </div>
  );
}
