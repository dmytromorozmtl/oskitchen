import { BusinessType, MenuStrategy } from "@prisma/client";
import { z } from "zod";

export const menuCreateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    preorderDeadline: z.coerce.date(),
    strategy: z.nativeEnum(MenuStrategy).optional(),
    description: z.string().trim().max(5000).optional().nullable(),
    collectionSlug: z.string().trim().max(160).optional().or(z.literal("")),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "Start date must be on or before end date",
    path: ["endDate"],
  })
  .refine((d) => d.preorderDeadline <= d.startDate, {
    message: "Preorder deadline must be on or before the menu start date",
    path: ["preorderDeadline"],
  });

/** Wizard / template creates — strategy required. */
export const menuWizardCreateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    preorderDeadline: z.coerce.date(),
    strategy: z.nativeEnum(MenuStrategy),
    description: z.string().trim().max(5000).optional().nullable(),
    collectionSlug: z.string().trim().max(160).optional().or(z.literal("")),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "Start date must be on or before end date",
    path: ["endDate"],
  })
  .refine((d) => d.preorderDeadline <= d.startDate, {
    message: "Preorder deadline must be on or before the menu start date",
    path: ["preorderDeadline"],
  });

export const productCategorySchema = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/, "Use letters, numbers, and underscores");

export const productUpsertSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5000).optional().nullable(),
    category: productCategorySchema.default("OTHER"),
    allergens: z.string().trim().max(2000).optional().nullable(),
    ingredients: z.string().trim().max(5000).optional().nullable(),
    portionSize: z.string().trim().max(200).optional().nullable(),
    reheatingInstructions: z.string().trim().max(2000).optional().nullable(),
    kitchenNotes: z.string().trim().max(2000).optional().nullable(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    preparedDate: z
      .union([z.coerce.date(), z.literal("")])
      .optional()
      .transform((d) => (d === "" || d === undefined ? new Date() : d)),
    pickupDate: z
      .union([z.coerce.date(), z.literal("")])
      .optional()
      .nullable()
      .transform((d) => (d === "" || d === undefined ? null : d)),
    deliveryAvailable: z.boolean().default(false),
    active: z.boolean().default(true),
    image: z
      .string()
      .optional()
      .nullable()
      .transform((s) => (!s || !s.trim() ? null : s.trim()))
      .refine((s) => s === null || /^https?:\/\/.+/i.test(s), {
        message: "Enter a valid image URL",
      }),
  })
  .refine(
    (d) => !d.pickupDate || d.pickupDate >= d.preparedDate,
    {
      message: "Pickup date cannot be before prepared date",
      path: ["pickupDate"],
    },
  );

export const fulfillmentSchema = z.enum(["PICKUP", "DELIVERY"]);

export const orderCreateSchema = z.object({
  customerName: z.string().trim().min(1).max(200),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().max(40).optional(),
  pickupDate: z.coerce.date().optional().nullable(),
  fulfillmentType: fulfillmentSchema.default("PICKUP"),
  notes: z.string().trim().max(5000).optional().nullable(),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(999),
      }),
    )
    .min(1, "Add at least one line item"),
});

export const kitchenSettingsSchema = z
  .object({
    businessType: z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : v),
      z.nativeEnum(BusinessType).optional().nullable(),
    ),
    businessName: z.string().trim().max(200).optional().nullable(),
    logoUrl: z
      .string()
      .optional()
      .nullable()
      .transform((s) => (!s || !s.trim() ? null : s.trim()))
      .refine((s) => s === null || /^https?:\/\/.+/i.test(s), {
        message: "Logo must be a valid URL",
      }),
    pickupAddress: z.string().trim().max(5000).optional().nullable(),
    deliveryEnabled: z.boolean(),
    deliveryNotes: z.string().trim().max(5000).optional().nullable(),
    deliveryRadiusKm: z.preprocess(
      (v) =>
        v === "" || v === undefined || v === null ? undefined : Number(v),
      z.number().int().min(0).max(500).optional(),
    ),
    deliveryFee: z.preprocess(
      (v) =>
        v === "" || v === undefined || v === null ? undefined : Number(v),
      z.number().min(0).max(99999).optional(),
    ),
    orderCutoffTime: z
      .string()
      .optional()
      .nullable()
      .transform((s) => (!s || !s.trim() ? null : s.trim())),
    timezone: z.string().trim().min(1).max(120).default("UTC"),
    kitchenWorkflowDefault: z.string().trim().max(10000).optional().nullable(),
    notifyOrderConfirmation: z.boolean(),
    notifyPreorderReminder: z.boolean(),
    notifyPickupReminder: z.boolean(),
    notifyDeliveryReminder: z.boolean(),
    locale: z.enum(["en", "fr"]),
  })
  .superRefine((data, ctx) => {
    if (
      data.orderCutoffTime &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.orderCutoffTime)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use HH:mm in 24-hour format (e.g. 14:30)",
        path: ["orderCutoffTime"],
      });
    }
  });
