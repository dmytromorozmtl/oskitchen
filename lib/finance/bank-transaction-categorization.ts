import type { BankLineType } from "@/lib/finance/bank-statement-types";

/** Pure categorization rules — shared by import service and accuracy benchmark. */
export function categorizeBankTransaction(
  description: string,
  type: BankLineType,
): string {
  const text = description.toLowerCase();

  if (type === "DEPOSIT") {
    if (
      /stripe|square|settlement|payout|deposit|pos|toast|clover|shopify/.test(text)
    ) {
      return "POS deposit";
    }
    return "Other deposit";
  }

  if (/sysco|supplier|vendor|foods|us foods|gordon|produce|wholesale/.test(text)) {
    return "Supplier payment";
  }
  if (/adp|payroll|gusto|wages|salary/.test(text)) {
    return "Payroll";
  }
  if (/rent|lease|landlord/.test(text)) {
    return "Rent";
  }
  if (/utility|electric|gas|water|internet/.test(text)) {
    return "Utilities";
  }

  return "Uncategorized expense";
}
