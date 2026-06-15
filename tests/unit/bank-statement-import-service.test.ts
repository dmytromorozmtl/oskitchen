import { describe, expect, it } from "vitest";

import {
  categorizeBankTransaction,
  parseBankStatementCsv,
  parseBankStatementText,
} from "@/services/finance/bank-statement-import-service";

describe("bank statement import service", () => {
  it("parses CSV with date, description, amount columns", () => {
    const csv = `date,description,amount,type
2026-06-01,Stripe payout,842.50,DEPOSIT
2026-06-02,Sysco payment,-412.00,WITHDRAWAL`;

    const { lines, warnings } = parseBankStatementCsv(csv);
    expect(warnings).toHaveLength(0);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      date: "2026-06-01",
      description: "Stripe payout",
      amount: 842.5,
      type: "DEPOSIT",
    });
    expect(lines[1].type).toBe("WITHDRAWAL");
  });

  it("categorizes POS deposits and supplier payments", () => {
    expect(categorizeBankTransaction("Stripe payout deposit", "DEPOSIT")).toBe("POS deposit");
    expect(categorizeBankTransaction("ACH Sysco Foods", "WITHDRAWAL")).toBe("Supplier payment");
    expect(categorizeBankTransaction("Random expense", "WITHDRAWAL")).toBe("Uncategorized expense");
  });

  it("parses text lines with date description amount pattern", () => {
    const text = `2026-06-01 Square settlement 1200.00
2026-06-03 ADP payroll -3200.00`;

    const { lines } = parseBankStatementText(text);
    expect(lines.length).toBeGreaterThanOrEqual(1);
    expect(lines[0].category).toBe("POS deposit");
  });
});
