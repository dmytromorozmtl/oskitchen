import type { ImportType, Prisma } from "@prisma/client";

export type ParsedCsvRow = Record<string, string>;

export type ImportValidationError = {
  rowNumber: number;
  field: string;
  message: string;
  rawRow: ParsedCsvRow;
};

export type ValidatedImport = {
  headers: string[];
  rows: ParsedCsvRow[];
  errors: ImportValidationError[];
  validRows: ParsedCsvRow[];
};

const REQUIRED_FIELDS: Record<ImportType, string[]> = {
  PRODUCTS: ["title", "price", "prepared_date"],
  CUSTOMERS: ["email"],
  ORDERS: ["order_number", "customer_email", "fulfillment_date"],
  INGREDIENTS: ["name", "unit", "cost_per_unit"],
  RECIPES: ["recipe_name", "product_title"],
  STAFF: ["name"],
  SUPPLIERS: ["supplier_name"],
  BRANDS: ["name"],
  LOCATIONS: ["name"],
  NUTRITION_ALLERGENS: ["product_id"],
  PRODUCT_MAPPINGS: ["provider", "external_product_id", "external_title"],
  MENU_ASSIGNMENTS: ["product_id", "menu_id"],
  PURCHASE_ITEMS: ["ingredient_id", "supplier_id"],
};

const ALIASES: Record<string, string> = {
  "product name": "title",
  item: "title",
  sku: "sku",
  "customer email": "customer_email",
  email: "email",
  "order id": "order_number",
  "order #": "order_number",
  "pickup date": "fulfillment_date",
  "delivery date": "fulfillment_date",
  date: "fulfillment_date",
  price: "price",
  total: "total",
};

export function normalizeHeader(header: string): string {
  const normalized = header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return ALIASES[header.trim().toLowerCase()] ?? normalized;
}

export function parseCsv(input: string): { headers: string[]; rows: ParsedCsvRow[] } {
  const lines = input.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];
      if (char === "\"" && inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else if (char === "\"") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.reduce<ParsedCsvRow>((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });

  return { headers, rows };
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function looksLikeMoney(value: string): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.replace(/[$,]/g, "")));
}

function looksLikeDate(value: string): boolean {
  return value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function validateImport(type: ImportType, csvText: string): ValidatedImport {
  const parsed = parseCsv(csvText);
  const required = REQUIRED_FIELDS[type];
  const errors: ImportValidationError[] = [];

  for (const field of required) {
    if (!parsed.headers.includes(field)) {
      errors.push({
        rowNumber: 0,
        field,
        message: `Column '${field}' could not be mapped. Add it or save a mapping template.`,
        rawRow: {},
      });
    }
  }

  const validRows: ParsedCsvRow[] = [];
  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const before = errors.length;
    for (const field of required) {
      if (!String(row[field] ?? "").trim()) {
        errors.push({ rowNumber, field, message: `${field} is missing`, rawRow: row });
      }
    }

    if (row.email && !looksLikeEmail(row.email)) {
      errors.push({ rowNumber, field: "email", message: "Email address is invalid", rawRow: row });
    }
    if (row.customer_email && !looksLikeEmail(row.customer_email)) {
      errors.push({
        rowNumber,
        field: "customer_email",
        message: "Customer email is invalid",
        rawRow: row,
      });
    }
    if (row.price && !looksLikeMoney(row.price)) {
      errors.push({ rowNumber, field: "price", message: "Price must be numeric", rawRow: row });
    }
    if (row.total && !looksLikeMoney(row.total)) {
      errors.push({ rowNumber, field: "total", message: "Total must be numeric", rawRow: row });
    }
    if (row.prepared_date && !looksLikeDate(row.prepared_date)) {
      errors.push({ rowNumber, field: "prepared_date", message: "Prepared date is invalid", rawRow: row });
    }
    if (row.fulfillment_date && !looksLikeDate(row.fulfillment_date)) {
      errors.push({
        rowNumber,
        field: "fulfillment_date",
        message: "Pickup/delivery date is missing or invalid",
        rawRow: row,
      });
    }

    if (errors.length === before) validRows.push(row);
  });

  return { headers: parsed.headers, rows: parsed.rows, errors, validRows };
}

export function mappingJsonFromHeaders(headers: string[]): Prisma.InputJsonObject {
  const mapping = headers.reduce<Record<string, string>>((acc, header) => {
    acc[header] = header;
    return acc;
  }, {});
  return mapping as Prisma.InputJsonObject;
}

export function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function confidenceScore(externalTitle: string, externalSku: string | null, product: { title: string }): number {
  const external = normalizeTitle(externalTitle);
  const internal = normalizeTitle(product.title);
  if (external && external === internal) return 0.95;
  if (externalSku && externalSku.length > 2 && internal.includes(normalizeTitle(externalSku))) return 0.75;
  const externalTokens = new Set(external.split(" ").filter(Boolean));
  const internalTokens = new Set(internal.split(" ").filter(Boolean));
  const overlap = [...externalTokens].filter((token) => internalTokens.has(token)).length;
  const denominator = Math.max(1, Math.max(externalTokens.size, internalTokens.size));
  return Math.round((overlap / denominator) * 100) / 100;
}
