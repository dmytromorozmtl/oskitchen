import { z } from "zod";

const ISO_CURRENCY = /^[A-Z]{3}$/;

export const businessNameSchema = z.string().trim().min(1, "Business name is required").max(200);

export const currencySchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .refine((s) => ISO_CURRENCY.test(s), "Use a 3-letter ISO currency code (e.g. USD)");

export function isValidIanaTimezone(tz: string): boolean {
  const t = tz.trim();
  if (!t || t.length > 80) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: t }).format();
    return true;
  } catch {
    return false;
  }
}

export const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone is required")
  .max(80)
  .refine(isValidIanaTimezone, "Use a valid IANA timezone (e.g. America/Toronto)");

export const localeSchema = z.enum(["en", "fr"]);

export const locationsCountSchema = z.coerce.number().int().min(1).max(9999).optional();
export const brandsCountSchema = z.coerce.number().int().min(0).max(9999).optional();
