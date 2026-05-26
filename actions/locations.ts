"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  LOCATION_ALL,
  LOCATION_COOKIE,
} from "@/lib/locations/location-context";
import { DAY_KEYS, normalizeWeeklyHoursInput, type DayKey } from "@/lib/locations/location-hours";
import { LOCATION_STATUS_VALUES, LOCATION_TYPE_VALUES } from "@/lib/locations/location-types";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  bulkAssignToLocation,
  createLocation,
  updateLocation,
} from "@/services/locations/location-service";
import {
  LocationAssignmentTarget,
  LocationStatus,
  LocationType,
  Prisma,
} from "@prisma/client";

const ALL_TASKS_REVALIDATES = [
  "/dashboard/locations",
  "/dashboard/locations/assignment",
  "/dashboard/locations/reports",
];

function revalidateLocations(locationId?: string) {
  for (const p of ALL_TASKS_REVALIDATES) revalidatePath(p);
  if (locationId) {
    revalidatePath(`/dashboard/locations/${locationId}`);
    revalidatePath(`/dashboard/locations/${locationId}/hours`);
    revalidatePath(`/dashboard/locations/${locationId}/fulfillment`);
    revalidatePath(`/dashboard/locations/${locationId}/reports`);
  }
}

/* ============================ legacy preserved ============================ */

const legacySchema = z.object({
  name: z.string().min(1).max(255),
  timezone: z.string().min(1).max(64).optional(),
});

export async function createLocationAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = legacySchema.safeParse({
      name: formData.get("name"),
      timezone: formData.get("timezone"),
    });
    if (!parsed.success) return { error: "Location name is required." };
    await createLocation({
      userId: dataUserId,
      name: parsed.data.name,
      timezone: parsed.data.timezone ?? null,
    });
    revalidateLocations();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createLocationFormAction(formData: FormData): Promise<void> {
  void (await createLocationAction(formData));
}

/* ============================ new wizard create ============================ */

const fullCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().max(120).optional().or(z.literal("")),
  type: z.enum(LOCATION_TYPE_VALUES).optional(),
  status: z.enum(LOCATION_STATUS_VALUES).optional(),
  timezone: z.string().max(64).optional().or(z.literal("")),
  phone: z.string().max(64).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  managerName: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  // address sub-fields
  line1: z.string().max(255).optional().or(z.literal("")),
  line2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  region: z.string().max(120).optional().or(z.literal("")),
  postalCode: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
});

export async function createFullLocationAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = fullCreateSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      type: formData.get("type") || undefined,
      status: formData.get("status") || undefined,
      timezone: formData.get("timezone"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      managerName: formData.get("managerName"),
      notes: formData.get("notes"),
      line1: formData.get("line1"),
      line2: formData.get("line2"),
      city: formData.get("city"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
    });
    if (!parsed.success) return { error: "Check location fields." };
    const d = parsed.data;

    const addressJson: Prisma.InputJsonValue | null =
      d.line1 || d.city || d.region || d.postalCode || d.country
        ? {
            line1: d.line1 || null,
            line2: d.line2 || null,
            city: d.city || null,
            region: d.region || null,
            postalCode: d.postalCode || null,
            country: d.country || null,
          }
        : null;

    const created = await createLocation({
      userId: dataUserId,
      name: d.name,
      slug: d.slug || null,
      type: (d.type as LocationType | undefined) ?? "RESTAURANT",
      status: (d.status as LocationStatus | undefined) ?? "SETUP",
      timezone: d.timezone || null,
      phone: d.phone || null,
      email: d.email || null,
      managerName: d.managerName || null,
      notes: d.notes || null,
      addressJson: addressJson ?? undefined,
    });
    revalidateLocations(created.id);
    return { ok: true as const, locationId: created.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createFullLocationFormAction(formData: FormData): Promise<void> {
  const r = await createFullLocationAction(formData);
  if ("ok" in r && r.ok) redirect(`/dashboard/locations/${r.locationId}`);
}

/* ============================ profile / settings updates ============================ */

const profileSchema = z.object({
  locationId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  type: z.enum(LOCATION_TYPE_VALUES).optional(),
  status: z.enum(LOCATION_STATUS_VALUES).optional(),
  timezone: z.string().max(64).optional().or(z.literal("")),
  phone: z.string().max(64).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  managerName: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  defaultBrandId: z.string().uuid().optional().or(z.literal("")),
  line1: z.string().max(255).optional().or(z.literal("")),
  line2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  region: z.string().max(120).optional().or(z.literal("")),
  postalCode: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
});

export async function updateLocationProfileAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = profileSchema.safeParse({
      locationId: formData.get("locationId"),
      name: formData.get("name") || undefined,
      type: formData.get("type") || undefined,
      status: formData.get("status") || undefined,
      timezone: formData.get("timezone"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      managerName: formData.get("managerName"),
      notes: formData.get("notes"),
      defaultBrandId: formData.get("defaultBrandId"),
      line1: formData.get("line1"),
      line2: formData.get("line2"),
      city: formData.get("city"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
    });
    if (!parsed.success) return { error: "Check fields." };
    const d = parsed.data;

    const addressJson =
      d.line1 || d.city || d.region || d.postalCode || d.country
        ? {
            line1: d.line1 || null,
            line2: d.line2 || null,
            city: d.city || null,
            region: d.region || null,
            postalCode: d.postalCode || null,
            country: d.country || null,
          }
        : null;

    await updateLocation({ userId: dataUserId }, d.locationId, {
      name: d.name,
      type: d.type as LocationType | undefined,
      status: d.status as LocationStatus | undefined,
      timezone: d.timezone || null,
      phone: d.phone || null,
      email: d.email || null,
      managerName: d.managerName || null,
      notes: d.notes || null,
      defaultBrandId: d.defaultBrandId || null,
      addressJson: (addressJson as Prisma.InputJsonValue) ?? null,
    });
    revalidateLocations(d.locationId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateLocationProfileFormAction(formData: FormData): Promise<void> {
  void (await updateLocationProfileAction(formData));
}

/* ============================ hours ============================ */

const hoursSchema = z.object({
  locationId: z.string().uuid(),
  scope: z.enum(["business", "pickup", "delivery"]),
});

export async function updateLocationHoursAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const meta = hoursSchema.safeParse({
      locationId: formData.get("locationId"),
      scope: formData.get("scope"),
    });
    if (!meta.success) return { error: "Invalid hours payload." };
    const input: Record<DayKey, { open?: string; close?: string; closed?: boolean | "on" }> = {} as never;
    for (const day of DAY_KEYS) {
      input[day] = {
        open: String(formData.get(`hours.${day}.open`) ?? "").trim() || undefined,
        close: String(formData.get(`hours.${day}.close`) ?? "").trim() || undefined,
        closed: formData.get(`hours.${day}.closed`) === "on",
      };
    }
    const weekly = normalizeWeeklyHoursInput(input);
    const field =
      meta.data.scope === "business"
        ? "businessHoursJson"
        : meta.data.scope === "pickup"
          ? "pickupHoursJson"
          : "deliveryHoursJson";
    await updateLocation({ userId: dataUserId }, meta.data.locationId, {
      [field]: weekly as Prisma.InputJsonValue,
    });
    revalidateLocations(meta.data.locationId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateLocationHoursFormAction(formData: FormData): Promise<void> {
  void (await updateLocationHoursAction(formData));
}

/* ============================ fulfillment ============================ */

const fulfillmentSchema = z.object({
  locationId: z.string().uuid(),
  pickupEnabled: z.enum(["on", ""]).optional(),
  deliveryEnabled: z.enum(["on", ""]).optional(),
  pickupInstructions: z.string().max(2000).optional().or(z.literal("")),
  deliveryInstructions: z.string().max(2000).optional().or(z.literal("")),
  pickupLeadMinutes: z.string().optional().or(z.literal("")),
  deliveryLeadMinutes: z.string().optional().or(z.literal("")),
  pickupCutoffMinutes: z.string().optional().or(z.literal("")),
  deliveryCutoffMinutes: z.string().optional().or(z.literal("")),
  minOrderAmountCents: z.string().optional().or(z.literal("")),
  deliveryFeeCents: z.string().optional().or(z.literal("")),
  maxOrdersPerWindow: z.string().optional().or(z.literal("")),
});

function toIntOrNull(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export async function updateLocationFulfillmentAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = fulfillmentSchema.safeParse({
      locationId: formData.get("locationId"),
      pickupEnabled: formData.get("pickupEnabled") || "",
      deliveryEnabled: formData.get("deliveryEnabled") || "",
      pickupInstructions: formData.get("pickupInstructions"),
      deliveryInstructions: formData.get("deliveryInstructions"),
      pickupLeadMinutes: formData.get("pickupLeadMinutes"),
      deliveryLeadMinutes: formData.get("deliveryLeadMinutes"),
      pickupCutoffMinutes: formData.get("pickupCutoffMinutes"),
      deliveryCutoffMinutes: formData.get("deliveryCutoffMinutes"),
      minOrderAmountCents: formData.get("minOrderAmountCents"),
      deliveryFeeCents: formData.get("deliveryFeeCents"),
      maxOrdersPerWindow: formData.get("maxOrdersPerWindow"),
    });
    if (!parsed.success) return { error: "Check fulfillment fields." };
    const d = parsed.data;
    const fulfillmentSettingsJson = {
      pickupEnabled: d.pickupEnabled === "on",
      deliveryEnabled: d.deliveryEnabled === "on",
      pickupInstructions: d.pickupInstructions || null,
      deliveryInstructions: d.deliveryInstructions || null,
      pickupLeadMinutes: toIntOrNull(d.pickupLeadMinutes || undefined),
      deliveryLeadMinutes: toIntOrNull(d.deliveryLeadMinutes || undefined),
      pickupCutoffMinutes: toIntOrNull(d.pickupCutoffMinutes || undefined),
      deliveryCutoffMinutes: toIntOrNull(d.deliveryCutoffMinutes || undefined),
      minOrderAmountCents: toIntOrNull(d.minOrderAmountCents || undefined),
      deliveryFeeCents: toIntOrNull(d.deliveryFeeCents || undefined),
      maxOrdersPerWindow: toIntOrNull(d.maxOrdersPerWindow || undefined),
    } satisfies Prisma.InputJsonValue;
    await updateLocation({ userId: dataUserId }, d.locationId, { fulfillmentSettingsJson });
    revalidateLocations(d.locationId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateLocationFulfillmentFormAction(formData: FormData): Promise<void> {
  void (await updateLocationFulfillmentAction(formData));
}

/* ============================ archive ============================ */

export async function archiveLocationAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const id = String(formData.get("locationId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid location id." };
    await updateLocation({ userId: dataUserId }, id, { status: "ARCHIVED" });
    revalidateLocations(id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function archiveLocationFormAction(formData: FormData): Promise<void> {
  void (await archiveLocationAction(formData));
}

/* ============================ assignment ============================ */

const assignSchema = z.object({
  target: z.nativeEnum(LocationAssignmentTarget),
  targetIds: z.string().min(1),
  locationId: z.string().uuid().optional().or(z.literal("")),
});

export async function bulkAssignAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = assignSchema.safeParse({
      target: formData.get("target"),
      targetIds: formData.get("targetIds"),
      locationId: formData.get("locationId") || undefined,
    });
    if (!parsed.success) return { error: "Pick a target + at least one row." };
    const ids = parsed.data.targetIds
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[0-9a-f-]{36}$/i.test(s));
    if (ids.length === 0) return { error: "No valid rows selected." };
    const result = await bulkAssignToLocation(
      { userId: dataUserId },
      parsed.data.target,
      ids,
      parsed.data.locationId || null,
      user.email ?? null,
    );
    revalidateLocations(parsed.data.locationId || undefined);
    return { ok: true as const, ...result };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function bulkAssignFormAction(formData: FormData): Promise<void> {
  void (await bulkAssignAction(formData));
}

/* ============================ switcher ============================ */

const setLocationSchema = z.object({
  value: z.string().min(1).max(48),
});

export async function setActiveLocationAction(formData: FormData) {
  try {
    const parsed = setLocationSchema.safeParse({ value: formData.get("value") });
    if (!parsed.success) return { error: "Invalid value." };
    const value = parsed.data.value === LOCATION_ALL ? LOCATION_ALL : parsed.data.value;
    if (value !== LOCATION_ALL && !/^[0-9a-f-]{36}$/i.test(value)) {
      return { error: "Invalid location id." };
    }
    const store = await cookies();
    store.set(LOCATION_COOKIE, value, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    // Light-touch revalidate so pages re-read context. We don't know the exact
    // page so we revalidate the dashboard root.
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setActiveLocationFormAction(formData: FormData): Promise<void> {
  void (await setActiveLocationAction(formData));
}
