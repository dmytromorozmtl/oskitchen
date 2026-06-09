import { categorizeBankTransaction } from "@/lib/finance/bank-transaction-categorization";
import {
  BANK_IMPORT_RECONCILIATION_MIN_CATEGORY_MATCH_PCT,
  BANK_IMPORT_RECONCILIATION_MIN_MONTHS,
  BANK_IMPORT_RECONCILIATION_MIN_TRANSACTIONS,
} from "@/lib/qa/bank-import-reconciliation-benchmark-policy";
import type { BankReconciliationFixture } from "@/lib/qa/bank-import-reconciliation-corpus";
import { monthKeysFromCorpus } from "@/lib/qa/bank-import-reconciliation-corpus";
import { parseBankStatementCsv } from "@/lib/finance/bank-statement-csv-parser";

export type BankReconciliationFieldScore = {
  transactionId: string;
  expectedCategory: string;
  predictedCategory: string;
  categoryMatch: boolean;
};

export type BankImportReconciliationBenchmarkResult = {
  monthCount: number;
  transactionCount: number;
  csvParseSuccessPct: number;
  categoryMatchPct: number;
  passed: boolean;
  thresholdPct: number;
  minMonths: number;
  minTransactions: number;
  byMonth: Record<string, { transactions: number; categoryMatchPct: number }>;
};

export function scoreBankTransactionCategory(
  fixture: BankReconciliationFixture,
): BankReconciliationFieldScore {
  const predictedCategory = categorizeBankTransaction(
    fixture.description,
    fixture.type,
  );
  return {
    transactionId: fixture.id,
    expectedCategory: fixture.expectedCategory,
    predictedCategory,
    categoryMatch: predictedCategory === fixture.expectedCategory,
  };
}

export function runBankImportReconciliationBenchmark(
  fixtures: BankReconciliationFixture[],
  csvText: string,
): BankImportReconciliationBenchmarkResult {
  const categoryScores = fixtures.map(scoreBankTransactionCategory);
  const categoryMatches = categoryScores.filter((score) => score.categoryMatch).length;
  const categoryMatchPct = Math.round((categoryMatches / fixtures.length) * 100);

  const parsed = parseBankStatementCsv(csvText);
  const csvParseSuccessPct =
    fixtures.length === 0
      ? 0
      : Math.round((parsed.lines.length / fixtures.length) * 100);

  const months = monthKeysFromCorpus(fixtures);
  const byMonth: BankImportReconciliationBenchmarkResult["byMonth"] = {};
  for (const month of months) {
    const monthFixtures = fixtures.filter((fixture) => fixture.month === month);
    const monthScores = monthFixtures.map(scoreBankTransactionCategory);
    const monthMatches = monthScores.filter((score) => score.categoryMatch).length;
    byMonth[month] = {
      transactions: monthFixtures.length,
      categoryMatchPct: Math.round((monthMatches / monthFixtures.length) * 100),
    };
  }

  const passed =
    months.length >= BANK_IMPORT_RECONCILIATION_MIN_MONTHS &&
    fixtures.length >= BANK_IMPORT_RECONCILIATION_MIN_TRANSACTIONS &&
    categoryMatchPct >= BANK_IMPORT_RECONCILIATION_MIN_CATEGORY_MATCH_PCT &&
    csvParseSuccessPct >= 95;

  return {
    monthCount: months.length,
    transactionCount: fixtures.length,
    csvParseSuccessPct,
    categoryMatchPct,
    passed,
    thresholdPct: BANK_IMPORT_RECONCILIATION_MIN_CATEGORY_MATCH_PCT,
    minMonths: BANK_IMPORT_RECONCILIATION_MIN_MONTHS,
    minTransactions: BANK_IMPORT_RECONCILIATION_MIN_TRANSACTIONS,
    byMonth,
  };
}
