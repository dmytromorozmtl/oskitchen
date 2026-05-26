import type { ImportType } from "@prisma/client";

export type TemplateField = {
  key: string;
  label: string;
  required: boolean;
  description?: string;
  aliases?: string[];
};

export type ImportTemplateSpec = {
  type: ImportType;
  label: string;
  description: string;
  fields: TemplateField[];
  sampleRow: Record<string, string>;
  validationNotes: string[];
  /** Whether the Import Center can persist rows of this type today. */
  committable: boolean;
};

export const IMPORT_TEMPLATES: Record<ImportType, ImportTemplateSpec> = {
  PRODUCTS: {
    type: "PRODUCTS",
    label: "Products / menu items",
    description: "Catalog items with title, SKU, price, and prep dates.",
    fields: [
      { key: "title", label: "Title", required: true, aliases: ["product_name", "name", "item"] },
      { key: "sku", label: "SKU", required: false, aliases: ["product_sku"] },
      { key: "price", label: "Price", required: true, aliases: ["unit_price"] },
      { key: "prepared_date", label: "Prepared date", required: true, aliases: ["prep_date"] },
      { key: "pickup_date", label: "Pickup date", required: false, aliases: ["delivery_date"] },
      { key: "description", label: "Description", required: false },
      { key: "allergens", label: "Allergens", required: false },
    ],
    sampleRow: {
      title: "Chicken Bowl Large",
      sku: "CHK-BOWL-L",
      price: "14.00",
      prepared_date: "2026-06-01",
      pickup_date: "2026-06-03",
      description: "High-protein bowl",
      allergens: "contains sesame",
    },
    validationNotes: [
      "title is required.",
      "price must be numeric (currency symbols stripped).",
      "prepared_date must be a valid date.",
      "SKU duplicates produce warnings, not errors.",
    ],
    committable: true,
  },
  CUSTOMERS: {
    type: "CUSTOMERS",
    label: "Customers",
    description: "CRM contacts with email, name, and phone.",
    fields: [
      { key: "email", label: "Email", required: true, aliases: ["customer_email"] },
      { key: "name", label: "Name", required: false, aliases: ["customer_name"] },
      { key: "phone", label: "Phone", required: false },
      { key: "notes", label: "Notes", required: false },
    ],
    sampleRow: { email: "jane@example.com", name: "Jane Customer", phone: "+15555550100", notes: "VIP weekly pickup" },
    validationNotes: [
      "email is required and must be a valid email address.",
      "duplicate emails are matched to existing customers (upsert mode required to update).",
    ],
    committable: true,
  },
  ORDERS: {
    type: "ORDERS",
    label: "Orders",
    description: "Staged orders with fulfillment date and item lines.",
    fields: [
      { key: "order_number", label: "Order number", required: true, aliases: ["order_id"] },
      { key: "customer_email", label: "Customer email", required: true },
      { key: "customer_name", label: "Customer name", required: false },
      { key: "total", label: "Total", required: false },
      { key: "fulfillment_type", label: "Fulfillment type", required: false },
      { key: "fulfillment_date", label: "Fulfillment date", required: true, aliases: ["pickup_date", "delivery_date"] },
      { key: "external_items", label: "External items", required: false },
    ],
    sampleRow: {
      order_number: "1005",
      customer_email: "jane@example.com",
      customer_name: "Jane Customer",
      total: "42.00",
      fulfillment_type: "PICKUP",
      fulfillment_date: "2026-06-03",
      external_items: "Chicken Bowl Large x2",
    },
    validationNotes: [
      "Orders are staged for review — they do not commit to the live Orders table from the Import Center.",
      "fulfillment_date must be a valid date.",
    ],
    committable: false,
  },
  INGREDIENTS: {
    type: "INGREDIENTS",
    label: "Ingredients",
    description: "Inventory ingredient list with unit, cost, and stock.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "unit", label: "Unit", required: true },
      { key: "cost_per_unit", label: "Cost per unit", required: true },
      { key: "current_stock", label: "Current stock", required: false },
      { key: "par_level", label: "Par level", required: false },
      { key: "supplier", label: "Supplier", required: false },
    ],
    sampleRow: {
      name: "Chicken breast",
      unit: "lb",
      cost_per_unit: "3.75",
      current_stock: "25",
      par_level: "40",
      supplier: "Sysco",
    },
    validationNotes: [
      "name and unit are required.",
      "cost_per_unit must be numeric.",
      "duplicate (name, unit) pairs produce warnings.",
    ],
    committable: true,
  },
  RECIPES: {
    type: "RECIPES",
    label: "Recipes",
    description: "Recipe scaffolds (product, yield, ingredient lines).",
    fields: [
      { key: "recipe_name", label: "Recipe name", required: true },
      { key: "product_title", label: "Product title", required: true },
      { key: "yield_quantity", label: "Yield quantity", required: false },
      { key: "yield_unit", label: "Yield unit", required: false },
      { key: "ingredient_name", label: "Ingredient", required: false },
      { key: "quantity", label: "Quantity", required: false },
      { key: "unit", label: "Unit", required: false },
    ],
    sampleRow: {
      recipe_name: "Chicken Bowl Large",
      product_title: "Chicken Bowl Large",
      yield_quantity: "1",
      yield_unit: "portion",
      ingredient_name: "Chicken breast",
      quantity: "0.5",
      unit: "lb",
    },
    validationNotes: [
      "Preview-only for the Import Center; commit happens in /dashboard/recipes.",
      "Missing product matches surface as errors before commit.",
    ],
    committable: false,
  },
  STAFF: {
    type: "STAFF",
    label: "Staff",
    description: "Staff roster with role.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "email", label: "Email", required: false },
      { key: "role", label: "Role", required: false },
    ],
    sampleRow: { name: "Alex Packer", email: "alex@example.com", role: "packing" },
    validationNotes: [
      "name is required.",
      "duplicate emails produce warnings.",
    ],
    committable: true,
  },
  SUPPLIERS: {
    type: "SUPPLIERS",
    label: "Suppliers",
    description: "Supplier directory.",
    fields: [
      { key: "supplier_name", label: "Supplier name", required: true, aliases: ["name"] },
      { key: "email", label: "Email", required: false },
      { key: "phone", label: "Phone", required: false },
    ],
    sampleRow: { supplier_name: "Main vendor", email: "orders@example.com", phone: "+15555550101" },
    validationNotes: [
      "Preview-only for the Import Center; commit happens in /dashboard/purchasing.",
    ],
    committable: false,
  },
  BRANDS: {
    type: "BRANDS",
    label: "Brands",
    description: "Concept / virtual brand directory.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "slug", label: "Slug", required: false },
      { key: "concept_kind", label: "Concept kind", required: false },
    ],
    sampleRow: { name: "Side concept", slug: "side-concept", concept_kind: "OTHER" },
    validationNotes: ["Preview-only — commit happens in /dashboard/brands."],
    committable: false,
  },
  LOCATIONS: {
    type: "LOCATIONS",
    label: "Locations",
    description: "Physical or virtual kitchens / pickup sites.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "timezone", label: "Timezone", required: false },
      { key: "slug", label: "Slug", required: false },
    ],
    sampleRow: { name: "Main kitchen", timezone: "America/Toronto", slug: "main-kitchen" },
    validationNotes: ["Preview-only — commit happens in /dashboard/locations."],
    committable: false,
  },
  NUTRITION_ALLERGENS: {
    type: "NUTRITION_ALLERGENS",
    label: "Nutrition & allergens",
    description: "Per-product nutrition + allergen overrides.",
    fields: [
      { key: "product_id", label: "Product id", required: true },
      { key: "calories", label: "Calories", required: false },
      { key: "protein", label: "Protein", required: false },
      { key: "allergens", label: "Allergens", required: false },
    ],
    sampleRow: { product_id: "<uuid>", calories: "420", protein: "25", allergens: "milk, wheat" },
    validationNotes: ["Preview-only — commit happens in /dashboard/nutrition."],
    committable: false,
  },
  PRODUCT_MAPPINGS: {
    type: "PRODUCT_MAPPINGS",
    label: "Product mappings",
    description: "External → internal product mapping suggestions.",
    fields: [
      { key: "provider", label: "Provider", required: true },
      { key: "external_product_id", label: "External product id", required: true },
      { key: "external_title", label: "External title", required: true },
      { key: "external_sku", label: "External SKU", required: false },
    ],
    sampleRow: { provider: "SHOPIFY", external_product_id: "123", external_title: "External item", external_sku: "SKU-1" },
    validationNotes: ["Preview-only — commit happens in /dashboard/product-mapping."],
    committable: false,
  },
  MENU_ASSIGNMENTS: {
    type: "MENU_ASSIGNMENTS",
    label: "Menu assignments",
    description: "Bulk assign products to menus.",
    fields: [
      { key: "product_id", label: "Product id", required: true },
      { key: "menu_id", label: "Menu id", required: true },
      { key: "visible", label: "Visible", required: false },
      { key: "sort_order", label: "Sort order", required: false },
    ],
    sampleRow: { product_id: "<product uuid>", menu_id: "<menu uuid>", visible: "yes", sort_order: "10" },
    validationNotes: ["Preview-only — commit happens in /dashboard/menus."],
    committable: false,
  },
  PURCHASE_ITEMS: {
    type: "PURCHASE_ITEMS",
    label: "Purchase items",
    description: "Purchasing catalogue items.",
    fields: [
      { key: "ingredient_id", label: "Ingredient id", required: true },
      { key: "supplier_id", label: "Supplier id", required: true },
      { key: "pack_size", label: "Pack size", required: false },
      { key: "pack_unit", label: "Pack unit", required: false },
      { key: "pack_price", label: "Pack price", required: false },
    ],
    sampleRow: {
      ingredient_id: "<uuid>",
      supplier_id: "<uuid>",
      pack_size: "10",
      pack_unit: "lb",
      pack_price: "32.50",
    },
    validationNotes: ["Preview-only — commit happens in /dashboard/purchasing."],
    committable: false,
  },
};

export function importTemplate(type: ImportType): ImportTemplateSpec {
  return IMPORT_TEMPLATES[type];
}

export function templateRequiredFields(type: ImportType): string[] {
  return IMPORT_TEMPLATES[type].fields.filter((f) => f.required).map((f) => f.key);
}

export function templateOptionalFields(type: ImportType): string[] {
  return IMPORT_TEMPLATES[type].fields.filter((f) => !f.required).map((f) => f.key);
}

export function templateFieldByKey(type: ImportType, key: string): TemplateField | null {
  return IMPORT_TEMPLATES[type].fields.find((f) => f.key === key) ?? null;
}
