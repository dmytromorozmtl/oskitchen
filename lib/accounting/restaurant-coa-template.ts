/**
 * Standard restaurant chart of accounts — maps to P&L line keys for GL-depth sync.
 */

export type CoaAccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type RestaurantCoaAccount = {
  code: string;
  name: string;
  type: CoaAccountType;
  normalBalance: "debit" | "credit";
  pnlLineKey: string | null;
  description: string;
};

export const RESTAURANT_COA_TEMPLATE: RestaurantCoaAccount[] = [
  {
    code: "1000",
    name: "Undeposited Funds",
    type: "asset",
    normalBalance: "debit",
    pnlLineKey: null,
    description: "Card/cash sales awaiting bank deposit",
  },
  {
    code: "1100",
    name: "Operating Cash",
    type: "asset",
    normalBalance: "debit",
    pnlLineKey: null,
    description: "Petty cash and register floats",
  },
  {
    code: "2000",
    name: "Accounts Payable",
    type: "liability",
    normalBalance: "credit",
    pnlLineKey: null,
    description: "Vendor invoices and AP accruals",
  },
  {
    code: "2100",
    name: "Payroll Payable",
    type: "liability",
    normalBalance: "credit",
    pnlLineKey: null,
    description: "Accrued labor awaiting payroll run",
  },
  {
    code: "3000",
    name: "Retained Earnings",
    type: "equity",
    normalBalance: "credit",
    pnlLineKey: null,
    description: "Equity offset for period-close journal entries",
  },
  {
    code: "4100",
    name: "Food & Beverage Sales",
    type: "revenue",
    normalBalance: "credit",
    pnlLineKey: "revenue",
    description: "Net sales from POS and channels",
  },
  {
    code: "5100",
    name: "Food Cost",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "food_cost",
    description: "COGS from recipes, invoices, and cost snapshots",
  },
  {
    code: "5200",
    name: "Labor Cost",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "labor",
    description: "Scheduled and clocked labor",
  },
  {
    code: "5300",
    name: "Occupancy",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "occupancy",
    description: "Rent, CAM, property tax allocation",
  },
  {
    code: "5400",
    name: "Operating Supplies",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "supplies",
    description: "Smallwares, disposables, cleaning",
  },
  {
    code: "5500",
    name: "Repairs & Maintenance",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "repairs",
    description: "Equipment and facility repairs",
  },
  {
    code: "5600",
    name: "Marketing",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "marketing",
    description: "Paid media, promos, loyalty",
  },
  {
    code: "5700",
    name: "Admin & G&A",
    type: "expense",
    normalBalance: "debit",
    pnlLineKey: "admin",
    description: "Back-office, software, professional fees",
  },
];

export function coaAccountByPnlLineKey(key: string): RestaurantCoaAccount | undefined {
  return RESTAURANT_COA_TEMPLATE.find((a) => a.pnlLineKey === key);
}

export function coaAccountByCode(code: string): RestaurantCoaAccount | undefined {
  return RESTAURANT_COA_TEMPLATE.find((a) => a.code === code);
}
