import type {
  DataMigrationEntity,
  DataMigrationPosSource,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import { migrationProfileKey } from "@/lib/import/data-migration-wizard-absolute-final-policy";

export type DataMigrationProfile = {
  source: DataMigrationPosSource;
  entity: DataMigrationEntity;
  label: string;
  templatePath: string;
  fieldMap: Record<string, string>;
  exportHint: string;
};

const profile = (
  source: DataMigrationPosSource,
  entity: DataMigrationEntity,
  label: string,
  templatePath: string,
  fieldMap: Record<string, string>,
  exportHint: string,
): DataMigrationProfile => ({
  source,
  entity,
  label,
  templatePath,
  fieldMap,
  exportHint,
});

export const DATA_MIGRATION_PROFILES: DataMigrationProfile[] = [
  profile(
    "toast",
    "menu",
    "Toast — menu items",
    "/lib/import/templates/toast-menu.csv",
    {
      menu_item: "product.title",
      price: "product.price",
      category: "product.category",
      allergens: "product.allergens",
    },
    "Toast Web: Reports → Menu → Export items CSV",
  ),
  profile(
    "toast",
    "customers",
    "Toast — guests",
    "/lib/import/templates/toast-customers.csv",
    {
      email: "customer.email",
      first_name: "customer.firstName",
      last_name: "customer.lastName",
      phone: "customer.phone",
    },
    "Toast Web: Marketing → Guest export (CSV)",
  ),
  profile(
    "toast",
    "orders",
    "Toast — order history",
    "/lib/import/templates/toast-orders.csv",
    {
      order_id: "order.externalId",
      opened_date: "order.createdAt",
      total: "order.total",
      guest_email: "order.customerEmail",
    },
    "Toast Web: Sales summary → Orders export (sample rows only in wizard)",
  ),
  profile(
    "square",
    "menu",
    "Square — catalog",
    "/lib/import/templates/square-menu.csv",
    {
      "Item Name": "product.title",
      "Variation Name": "product.variantTitle",
      Price: "product.price",
      Category: "product.category",
    },
    "Square Dashboard: Items → Export library (CSV)",
  ),
  profile(
    "square",
    "customers",
    "Square — customers",
    "/lib/import/templates/square-customers.csv",
    {
      "Email Address": "customer.email",
      "First Name": "customer.firstName",
      "Last Name": "customer.lastName",
      "Phone Number": "customer.phone",
    },
    "Square Dashboard: Customers → Export",
  ),
  profile(
    "square",
    "orders",
    "Square — transactions",
    "/lib/import/templates/square-orders.csv",
    {
      "Transaction ID": "order.externalId",
      Date: "order.createdAt",
      Total: "order.total",
      "Customer Email": "order.customerEmail",
    },
    "Square Dashboard: Transactions → Export (date range)",
  ),
  profile(
    "lightspeed",
    "menu",
    "Lightspeed — products",
    "/lib/import/templates/lightspeed-menu.csv",
    {
      Product: "product.title",
      SKU: "product.sku",
      Price: "product.price",
      Category: "product.category",
    },
    "Lightspeed Retail/K: Inventory → Products export",
  ),
  profile(
    "lightspeed",
    "customers",
    "Lightspeed — customers",
    "/lib/import/templates/lightspeed-customers.csv",
    {
      email: "customer.email",
      firstName: "customer.firstName",
      lastName: "customer.lastName",
      phone: "customer.phone",
    },
    "Lightspeed: Customers → Export CSV",
  ),
  profile(
    "lightspeed",
    "orders",
    "Lightspeed — sales",
    "/lib/import/templates/lightspeed-orders.csv",
    {
      sale_id: "order.externalId",
      completed_at: "order.createdAt",
      total: "order.total",
      customer_email: "order.customerEmail",
    },
    "Lightspeed: Sales history export (CSV)",
  ),
];

export const DATA_MIGRATION_PROFILE_MAP = new Map(
  DATA_MIGRATION_PROFILES.map((p) => [migrationProfileKey(p.source, p.entity), p]),
);

export function getDataMigrationProfile(
  source: DataMigrationPosSource,
  entity: DataMigrationEntity,
): DataMigrationProfile | null {
  return DATA_MIGRATION_PROFILE_MAP.get(migrationProfileKey(source, entity)) ?? null;
}

export function listProfilesForSource(source: DataMigrationPosSource): DataMigrationProfile[] {
  return DATA_MIGRATION_PROFILES.filter((p) => p.source === source);
}
