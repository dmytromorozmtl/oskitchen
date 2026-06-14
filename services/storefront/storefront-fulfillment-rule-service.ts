import { z } from "zod";

const rulesDocSchema = z
  .object({
    type: z.string().min(1).max(120),
  })
  .passthrough();

export function parseFulfillmentRulesJsonForSave(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "{}") as unknown;
  } catch {
    return { ok: false, error: "rulesJson must be valid JSON." };
  }
  const doc = rulesDocSchema.safeParse(parsed);
  if (!doc.success) {
    return { ok: false, error: "rulesJson must include a non-empty type field." };
  }
  return { ok: true, value: doc.data };
}
