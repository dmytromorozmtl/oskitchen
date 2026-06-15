/**
 * Privacy-aware rendering helpers. Used wherever we expose customer data
 * to non-CRM roles (kitchen screen, packing slips, driver manifests, etc.).
 */

import type { KitchenCustomer } from "@prisma/client";

export type CustomerPublicView = {
  id: string;
  firstName: string | null;
  lastNameInitial: string | null;
  email: string | null;
  phoneMasked: string | null;
};

/** Mask phone like "+1 ••• ••• 0100". */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last = digits.slice(-4);
  return `••• ••• ${last}`;
}

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  if (user.length <= 2) return `${user[0] ?? "*"}*@${domain}`;
  return `${user[0]}${"*".repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}@${domain}`;
}

export function toPublicView(c: Pick<KitchenCustomer, "id" | "firstName" | "lastName" | "name" | "email" | "phone">): CustomerPublicView {
  const fallback = c.name?.trim().split(/\s+/) ?? [];
  const first = c.firstName ?? fallback[0] ?? null;
  const last = c.lastName ?? fallback[fallback.length - 1] ?? null;
  return {
    id: c.id,
    firstName: first ?? null,
    lastNameInitial: last ? last[0] : null,
    email: maskEmail(c.email),
    phoneMasked: maskPhone(c.phone),
  };
}

/**
 * Parses a JSON allergies field into a string array. Forgiving by design.
 */
export function parseAllergies(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") {
    return value.split(/[,;]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  }
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  }
  if (typeof value === "object") {
    const list = (value as { list?: unknown }).list;
    if (Array.isArray(list)) return list.filter((v): v is string => typeof v === "string");
  }
  return [];
}

export const parseDietaryPreferences = parseAllergies;
export const parseDislikes = parseAllergies;
export const parseFavoriteItems = parseAllergies;
export const parseTags = parseAllergies;

/**
 * "Has anything kitchen-relevant" check used by Order Hub / Packing / Kitchen
 * Screen to render a single allergy chip without rendering full PII.
 */
export function hasKitchenRelevantNotes(
  c: Pick<KitchenCustomer, "allergiesJson" | "dietaryPreferencesJson">,
): boolean {
  return parseAllergies(c.allergiesJson).length > 0 || parseDietaryPreferences(c.dietaryPreferencesJson).length > 0;
}
