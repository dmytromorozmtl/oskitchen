import type { BankLineType } from "@/lib/finance/bank-statement-types";

export type BankReconciliationFixture = {
  id: string;
  month: string;
  date: string;
  description: string;
  amount: number;
  type: BankLineType;
  expectedCategory: string;
};

const MONTHS = ["2026-04", "2026-05", "2026-06"] as const;

const DEPOSIT_PATTERNS: Array<{ description: string; category: string }> = [
  { description: "Stripe payout settlement", category: "POS deposit" },
  { description: "Square deposit POS", category: "POS deposit" },
  { description: "Toast settlement batch", category: "POS deposit" },
  { description: "Clover payout deposit", category: "POS deposit" },
  { description: "Shopify payout transfer", category: "POS deposit" },
  { description: "Wire transfer refund", category: "Other deposit" },
  { description: "Miscellaneous credit", category: "Other deposit" },
];

const WITHDRAWAL_PATTERNS: Array<{ description: string; category: string }> = [
  { description: "ACH Sysco Foods invoice", category: "Supplier payment" },
  { description: "US Foods vendor payment", category: "Supplier payment" },
  { description: "Gordon Food Service wholesale", category: "Supplier payment" },
  { description: "Fresh produce supplier", category: "Supplier payment" },
  { description: "ADP payroll run", category: "Payroll" },
  { description: "Gusto wages transfer", category: "Payroll" },
  { description: "Monthly rent landlord", category: "Rent" },
  { description: "Lease payment office", category: "Rent" },
  { description: "Electric utility bill", category: "Utilities" },
  { description: "Gas and water utility", category: "Utilities" },
  { description: "Internet service provider", category: "Utilities" },
  { description: "Office supplies misc", category: "Uncategorized expense" },
  { description: "Bank service fee", category: "Uncategorized expense" },
];

function buildMonthFixtures(month: string, monthIndex: number): BankReconciliationFixture[] {
  const fixtures: BankReconciliationFixture[] = [];
  let day = 1;

  for (let i = 0; i < 10; i++) {
    const pattern = DEPOSIT_PATTERNS[(monthIndex * 3 + i) % DEPOSIT_PATTERNS.length]!;
    fixtures.push({
      id: `${month}-dep-${i + 1}`,
      month,
      date: `${month}-${String(day).padStart(2, "0")}`,
      description: pattern.description,
      amount: Number((800 + monthIndex * 120 + i * 47.25).toFixed(2)),
      type: "DEPOSIT",
      expectedCategory: pattern.category,
    });
    day += 2;
  }

  for (let i = 0; i < 20; i++) {
    const pattern =
      WITHDRAWAL_PATTERNS[(monthIndex * 5 + i) % WITHDRAWAL_PATTERNS.length]!;
    fixtures.push({
      id: `${month}-wd-${i + 1}`,
      month,
      date: `${month}-${String(day).padStart(2, "0")}`,
      description: pattern.description,
      amount: Number((150 + monthIndex * 35 + i * 22.5).toFixed(2)),
      type: "WITHDRAWAL",
      expectedCategory: pattern.category,
    });
    day = day >= 28 ? 1 : day + 1;
  }

  return fixtures;
}

/** 90 transactions across 3 months (Apr–Jun 2026) with ground-truth categories. */
export function buildBankImportReconciliationCorpus(): BankReconciliationFixture[] {
  return MONTHS.flatMap((month, index) => buildMonthFixtures(month, index));
}

export function buildBankImportReconciliationCsv(
  fixtures: BankReconciliationFixture[],
): string {
  const header = "date,description,amount,type";
  const rows = fixtures.map((fixture) => {
    const signed =
      fixture.type === "WITHDRAWAL" ? -fixture.amount : fixture.amount;
    return `${fixture.date},${fixture.description},${signed.toFixed(2)},${fixture.type}`;
  });
  return [header, ...rows].join("\n");
}

export function monthKeysFromCorpus(
  fixtures: BankReconciliationFixture[],
): string[] {
  return [...new Set(fixtures.map((fixture) => fixture.month))].sort();
}
