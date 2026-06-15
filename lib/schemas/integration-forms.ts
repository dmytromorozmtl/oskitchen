import { z } from "zod";

export const wooCommerceSettingsSchema = z.object({
  name: z.string().min(1).max(255),
  baseUrl: z.string().url(),
  /** Empty means keep existing encrypted value when updating. */
  consumerKey: z.coerce.string(),
  consumerSecret: z.coerce.string(),
  webhookSecret: z.coerce.string().optional(),
  autoImportOrders: z.boolean().optional(),
  autoCreateProducts: z.boolean().optional(),
});

export const shopifySettingsSchema = z.object({
  name: z.string().min(1).max(255),
  shopDomain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i, "Use your-store.myshopify.com"),
  /** Leave empty to keep existing encrypted token. */
  adminAccessToken: z.string().optional().or(z.literal("")),
  webhookSecret: z.string().optional().or(z.literal("")),
  apiVersion: z.string().default("2025-01"),
});

export const uberEatsSettingsSchema = z.object({
  name: z.string().min(1).max(255),
  externalStoreId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  clientSecret: z.string().optional().or(z.literal("")),
  webhookSigningSecret: z.string().optional().or(z.literal("")),
  menuSyncEnabled: z.boolean().optional(),
  orderIngestionEnabled: z.boolean().optional(),
});

export const uberDirectSettingsSchema = z.object({
  name: z.string().min(1).max(255),
  customerId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  clientSecret: z.string().optional().or(z.literal("")),
  pickupAddress: z.string().optional().or(z.literal("")),
  deliveryQuoteEnabled: z.boolean().optional(),
  autoDispatchEnabled: z.boolean().optional(),
  deliveryRadiusKm: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().min(1).max(200).optional(),
  ),
  defaultPickupInstructions: z.string().max(2000).optional().or(z.literal("")),
});

export type WooCommerceSettingsInput = z.infer<typeof wooCommerceSettingsSchema>;
export type ShopifySettingsInput = z.infer<typeof shopifySettingsSchema>;
export type UberEatsSettingsInput = z.infer<typeof uberEatsSettingsSchema>;
export type UberDirectSettingsInput = z.infer<typeof uberDirectSettingsSchema>;
