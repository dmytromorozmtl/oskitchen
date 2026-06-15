import { z } from "zod";

export const STOREFRONT_FORM_FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "textarea",
  "select",
  "checkbox",
  "date",
  "file",
  "hidden",
  "consent_checkbox",
] as const;

export const STOREFRONT_FORM_FILE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const STOREFRONT_FORM_FILE_MAX_BYTES = 5 * 1024 * 1024;

const fieldSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(STOREFRONT_FORM_FIELD_TYPES),
  label: z.string().min(1).max(200),
  required: z.boolean().optional(),
  placeholder: z.string().max(200).optional(),
  options: z.array(z.string().max(200)).optional(),
  defaultValue: z.string().max(2000).optional(),
  maxSizeMb: z.number().min(1).max(10).optional(),
});

export const storefrontFormFieldsSchema = z.array(fieldSchema).min(1).max(40);

export type StorefrontFormField = z.infer<typeof fieldSchema>;

export function parseStorefrontFormFieldsJson(raw: unknown): { fields: StorefrontFormField[]; error?: string } {
  const p = storefrontFormFieldsSchema.safeParse(raw);
  if (!p.success) return { fields: [], error: "Invalid fields JSON." };
  return { fields: p.data };
}

export const DEFAULT_CONTACT_FORM_FIELDS: StorefrontFormField[] = [
  { id: "name", type: "text", label: "Name", required: true },
  { id: "email", type: "email", label: "Email", required: true },
  { id: "phone", type: "phone", label: "Phone", required: false },
  { id: "message", type: "textarea", label: "Message", required: true },
];

export const DEFAULT_CATERING_FORM_FIELDS: StorefrontFormField[] = [
  { id: "name", type: "text", label: "Name", required: true },
  { id: "email", type: "email", label: "Email", required: true },
  { id: "eventDate", type: "date", label: "Event date", required: false },
  { id: "guestCount", type: "text", label: "Guest count", required: false },
  { id: "message", type: "textarea", label: "Details", required: true },
  { id: "consent", type: "consent_checkbox", label: "I agree to be contacted about this inquiry.", required: true },
];