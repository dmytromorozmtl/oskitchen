import type { Prisma } from "@prisma/client";

/** Theme experiment / compliance blob stored on {@link Prisma.StorefrontSettings.themeExperimentJson}. */
export type ThemeExperimentJson = Prisma.JsonValue;

/** Poll step that mutates theme experiment JSON (compliance / CRDT / mesh modules). */
export type ThemeExperimentPoll = (raw: unknown, ..._ctx: unknown[]) => { json: unknown };

/**
 * Coerce unknown runtime data into a Prisma-safe JSON value (recursive, strips undefined).
 */
export function toJsonValue(value: unknown): Prisma.JsonValue {
  if (value === null || value === undefined) {
    return {};
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return String(value);
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item)) as Prisma.JsonArray;
  }
  if (typeof value === "object") {
    const out: Record<string, Prisma.JsonValue> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) continue;
      out[key] = toJsonValue(val);
    }
    return out;
  }
  return String(value);
}

/** Alias for Prisma write paths (`create` / `update` data fields). */
export function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return toJsonValue(value) as Prisma.InputJsonValue;
}

/** Normalize nullable DB JSON to a JsonValue object root. */
export function coalesceThemeExperimentJson(raw: unknown): Prisma.JsonValue {
  if (raw === null || raw === undefined) return {};
  return toJsonValue(raw);
}

/** Apply a chain of poll/merge steps used by storefront experiment sync crons. */
export function foldThemeExperimentJson(
  initial: Prisma.JsonValue | null | undefined,
  polls: ThemeExperimentPoll[],
): Prisma.JsonValue {
  let current: unknown = coalesceThemeExperimentJson(initial);
  for (const poll of polls) {
    current = poll(current).json;
  }
  return toJsonValue(current);
}

/** Single poll step — convenience for imperative sync loops. */
export function applyThemeExperimentPoll(
  current: Prisma.JsonValue | null | undefined,
  poll: ThemeExperimentPoll,
): Prisma.JsonValue {
  return toJsonValue(poll(coalesceThemeExperimentJson(current)).json);
}

/** Spread-safe object copy for reading nested experiment keys. */
export function asJsonRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return { ...(raw as Record<string, unknown>) };
}
