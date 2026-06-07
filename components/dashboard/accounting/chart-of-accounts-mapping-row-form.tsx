"use client";

import { updateCoaMappingRowAction } from "@/actions/accounting/chart-of-accounts-mapping";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { CHART_OF_ACCOUNTS_MAPPING_PNL_LABELS } from "@/lib/accounting/chart-of-accounts-mapping-content";
import type { CoaMappingModel } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { RESTAURANT_COA_TEMPLATE } from "@/lib/accounting/restaurant-coa-template";

export function ChartOfAccountsMappingRowForm({
  row,
  quickBooksConnected,
  quickBooksAccounts,
}: {
  row: CoaMappingModel["mappings"][number];
  quickBooksConnected: boolean;
  quickBooksAccounts: CoaMappingModel["quickBooksAccounts"];
}) {
  const pnlLabel =
    CHART_OF_ACCOUNTS_MAPPING_PNL_LABELS[
      row.pnlLineKey as keyof typeof CHART_OF_ACCOUNTS_MAPPING_PNL_LABELS
    ] ?? row.pnlLineLabel;

  return (
    <tr data-testid="coa-mapping-row">
      <TableCell className="font-medium">{pnlLabel}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{row.pnlLineKey}</TableCell>
      <TableCell colSpan={3}>
        <form action={updateCoaMappingRowAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="pnlLineKey" value={row.pnlLineKey} />
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Internal GL</span>
            <select
              name="glAccountCode"
              defaultValue={row.glAccountCode}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-2 text-sm"
            >
              {RESTAURANT_COA_TEMPLATE.filter(
                (a) => a.pnlLineKey || a.type === "revenue" || a.type === "expense",
              ).map((account) => (
                <option key={account.code} value={account.code}>
                  {account.code} — {account.name}
                </option>
              ))}
            </select>
          </label>
          {quickBooksConnected ? (
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">QuickBooks account</span>
              <select
                name="externalAccountId"
                defaultValue={row.externalAccountId ?? ""}
                className="h-9 min-w-[200px] rounded-md border border-input bg-background px-2 text-sm"
                onChange={(e) => {
                  const selected = e.target.selectedOptions[0];
                  const nameInput = e.currentTarget.form?.querySelector<HTMLInputElement>(
                    'input[name="externalAccountName"]',
                  );
                  if (nameInput) {
                    const text = selected?.textContent ?? "";
                    nameInput.value = text.includes(" — ") ? text.split(" — ").slice(1).join(" — ") : text;
                  }
                }}
              >
                <option value="">— Not linked —</option>
                {quickBooksAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} — {account.accountType}
                  </option>
                ))}
              </select>
              <input type="hidden" name="externalAccountName" defaultValue={row.externalAccountName ?? ""} />
              <input type="hidden" name="externalProvider" value="quickbooks" />
            </label>
          ) : (
            <>
              <input type="hidden" name="externalAccountId" value="" />
              <input type="hidden" name="externalAccountName" value="" />
            </>
          )}
          <Button type="submit" size="sm" variant="outline" className="rounded-full">
            Save
          </Button>
        </form>
      </TableCell>
      <TableCell>
        {row.externalAccountId ? (
          <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
            QB linked
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full text-[10px] font-normal">
            Internal only
          </Badge>
        )}
      </TableCell>
    </tr>
  );
}
