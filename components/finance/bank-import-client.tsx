"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  commitBankStatementAction,
  previewBankStatementAction,
} from "@/actions/finance/bank-statement-import";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import type { BankStatementImportPreview } from "@/services/finance/bank-statement-import-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ImportSource = "csv" | "pdf" | "photo";

type RecentImport = {
  id: string;
  date: Date;
  description: string;
  amount: { toString(): string };
  type: string;
  category: string | null;
  reconciled: boolean;
  createdAt: Date;
};

export function BankImportClient({
  recentImports,
  aiConfigured,
}: {
  recentImports: RecentImport[];
  aiConfigured: boolean;
}) {
  const [source, setSource] = React.useState<ImportSource>("csv");
  const [csvText, setCsvText] = React.useState(
    "date,description,amount,type\n2026-06-01,Stripe payout deposit,842.50,DEPOSIT\n2026-06-02,Sysco Foods payment,-412.00,WITHDRAWAL",
  );
  const [pdfText, setPdfText] = React.useState("");
  const [preview, setPreview] = React.useState<BankStatementImportPreview | null>(null);
  const [pending, startTransition] = React.useTransition();

  function handlePreview(formData: FormData) {
    formData.set("source", source);
    if (source === "csv") {
      formData.set("csvText", csvText);
    }
    if (source === "pdf" && pdfText) {
      formData.set("pdfText", pdfText);
    }

    startTransition(async () => {
      const res = await previewBankStatementAction(formData);
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Preview failed");
        return;
      }
      setPreview(res.data.preview);
      if (res.data.preview.parseWarnings.length) {
        toast.message(res.data.preview.parseWarnings.join(" "));
      } else {
        toast.success(`Parsed ${res.data.preview.summary.lineCount} transactions`);
      }
    });
  }

  function handleCommit() {
    if (!preview?.lines.length) return;
    const formData = new FormData();
    formData.set("linesJson", JSON.stringify(preview.lines));

    startTransition(async () => {
      const res = await commitBankStatementAction(formData);
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Import failed");
        return;
      }
      toast.success(
        `Imported ${res.data.result.imported} transactions · ${res.data.result.autoReconciled} auto-matched`,
      );
      setPreview(null);
    });
  }

  return (
    <div className="space-y-6" data-testid="bank-import-panel">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import source</CardTitle>
          <CardDescription>
            CSV export, PDF statement, or photograph. Transactions are auto-categorized and matched to orders or supplier invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Import source">
            {(["csv", "pdf", "photo"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={source === tab}
                data-testid={`bank-import-tab-${tab}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm capitalize",
                  source === tab ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground",
                )}
                onClick={() => setSource(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handlePreview(new FormData(event.currentTarget));
            }}
            className="space-y-3"
          >
            {source === "csv" ? (
              <textarea
                data-testid="bank-import-csv-input"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={6}
                className="w-full rounded-xl border px-3 py-2 font-mono text-sm"
                placeholder="date,description,amount,type"
              />
            ) : null}

            {source === "pdf" ? (
              <div className="space-y-3">
                <input
                  data-testid="bank-import-pdf-file"
                  type="file"
                  name="file"
                  accept="application/pdf,.pdf"
                  className="block w-full text-sm"
                />
                <textarea
                  data-testid="bank-import-pdf-text"
                  value={pdfText}
                  onChange={(e) => setPdfText(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Or paste extracted PDF text (date description amount per line)"
                />
              </div>
            ) : null}

            {source === "photo" ? (
              <div className="space-y-2">
                <input
                  data-testid="bank-import-photo-file"
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  capture="environment"
                  className="block w-full text-sm"
                />
                {!aiConfigured ? (
                  <p className="text-xs text-amber-700 dark:text-amber-200">
                    Photo parsing requires OPENAI_API_KEY. CSV and PDF text still work offline.
                  </p>
                ) : null}
              </div>
            ) : null}

            <Button type="submit" disabled={pending} data-testid="bank-import-preview-btn">
              {pending ? "Parsing…" : "Preview import"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {preview ? (
        <Card data-testid="bank-import-preview">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>
              {preview.summary.lineCount} lines · ${preview.summary.depositTotal.toFixed(2)} deposits · $
              {preview.summary.withdrawalTotal.toFixed(2)} withdrawals · {preview.summary.autoMatchedCount}{" "}
              auto-matched
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.parseWarnings.map((warning) => (
              <p key={warning} className="text-xs text-amber-700 dark:text-amber-200">
                {warning}
              </p>
            ))}
            <div className="max-h-80 overflow-y-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                    <th className="px-3 py-2 text-left font-medium">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.lines.map((line, index) => (
                    <tr key={`${line.date}-${line.description}-${index}`} className="border-t">
                      <td className="px-3 py-2 whitespace-nowrap">{line.date}</td>
                      <td className="px-3 py-2">{line.description}</td>
                      <td className="px-3 py-2 text-right">
                        {line.type === "WITHDRAWAL" ? "−" : "+"}${line.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{line.category}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {line.matchSuggestion ? (
                          <>
                            {line.matchSuggestion.label}
                            <span className="ml-1 text-primary">
                              ({Math.round(line.matchConfidence * 100)}%)
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCommit} disabled={pending} data-testid="bank-import-commit-btn">
                Import {preview.summary.lineCount} transactions
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)}>
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent imports</CardTitle>
          <CardDescription>
            Imported transactions appear here and in{" "}
            <Link href="/dashboard/accounting/bank-reconciliation" className="text-primary underline-offset-4 hover:underline">
              bank reconciliation
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {recentImports.length === 0 ? (
            <p className="text-muted-foreground">No bank transactions yet.</p>
          ) : (
            recentImports.map((tx) => (
              <div key={tx.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.date.toISOString().slice(0, 10)} · {tx.category ?? "Uncategorized"} · {tx.type}
                  </p>
                </div>
                <div className="text-right">
                  <p>${Number(tx.amount).toFixed(2)}</p>
                  {tx.reconciled ? (
                    <p className="text-xs text-primary">Reconciled</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Unreconciled</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
