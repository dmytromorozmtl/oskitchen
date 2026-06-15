import { z } from "zod";

const SKU_PATTERN = /^[A-Za-z0-9._\-]{1,64}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const menuItemSkuSchema = z
  .string()
  .max(64)
  .optional()
  .refine((v) => v == null || v === "" || SKU_PATTERN.test(v), "Invalid SKU format.");

export const menuItemSlugSchema = z
  .string()
  .max(160)
  .optional()
  .refine((v) => v == null || v === "" || SLUG_PATTERN.test(v), "Invalid slug format.");

export function isReasonableImageUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
