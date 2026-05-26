import { toCsv } from "@/lib/import-export/csv-format";

export const TEMPLATE_KINDS = [
  "customers",
  "menu_items",
  "ingredients",
  "recipes",
  "suppliers",
  "orders",
  "brands",
  "locations",
  "nutrition_allergens",
  "product_mapping",
  "menu_assignments",
] as const;

export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

export function isTemplateKind(v: string | null): v is TemplateKind {
  return v != null && (TEMPLATE_KINDS as readonly string[]).includes(v);
}

export function buildTemplateCsv(kind: TemplateKind): { filename: string; body: string } {
  switch (kind) {
    case "ingredients":
      return {
        filename: "ingredients_template.csv",
        body: toCsv(
          ["name", "unit", "category", "supplier", "costPerUnit"],
          [["Example flour", "kg", "Dry goods", "Main vendor", "2.50"]],
        ),
      };
    case "customers":
      return {
        filename: "customers_template.csv",
        body: toCsv(["email", "name", "phone"], [["guest@example.com", "Sample Guest", ""]]),
      };
    case "menu_items":
      return {
        filename: "menu_items_template.csv",
        body: toCsv(["title", "menuTitle", "category", "price", "active"], [["Sample item", "Weekly menu", "MAINS", "12.00", "yes"]]),
      };
    case "recipes":
      return {
        filename: "recipes_template.csv",
        body: toCsv(["productId", "yieldQuantity", "yieldUnit", "laborMinutes"], [["<uuid>", "10", "each", "15"]]),
      };
    case "suppliers":
      return {
        filename: "suppliers_template.csv",
        body: toCsv(["name", "email", "phone"], [["Sample supplier", "orders@example.com", ""]]),
      };
    case "orders":
      return {
        filename: "orders_template.csv",
        body: toCsv(["customerEmail", "customerName", "fulfillmentType", "total"], [["guest@example.com", "Guest", "PICKUP", "25.00"]]),
      };
    case "brands":
      return {
        filename: "brands_template.csv",
        body: toCsv(["name", "slug", "conceptKind"], [["Side concept", "side-concept", "OTHER"]]),
      };
    case "locations":
      return {
        filename: "locations_template.csv",
        body: toCsv(["name", "timezone"], [["Main kitchen", "America/Toronto"]]),
      };
    case "nutrition_allergens":
      return {
        filename: "nutrition_allergens_template.csv",
        body: toCsv(["productId", "calories", "protein", "allergens"], [["<uuid>", "420", "25", "milk, wheat"]]),
      };
    case "product_mapping":
      return {
        filename: "product_mapping_template.csv",
        body: toCsv(["provider", "externalProductId", "externalTitle", "externalSku"], [["SHOPIFY", "123", "External item", "SKU-1"]]),
      };
    case "menu_assignments":
      return {
        filename: "menu_assignments_template.csv",
        body: toCsv(["productId", "menuId", "visible", "sortOrder"], [["<product uuid>", "<menu uuid>", "yes", "10"]]),
      };
    default: {
      const _e: never = kind;
      return _e;
    }
  }
}
