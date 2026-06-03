export type GiftCardDeliveryType = "digital" | "physical";

export type GiftCardProgramSettings = {
  digitalEnabled: boolean;
  physicalEnabled: boolean;
  /** Preset amounts shown in the loyalty gift card hub (USD). */
  denominations: number[];
  physicalCodePrefix: string;
};

export const DEFAULT_GIFT_CARD_PROGRAM: GiftCardProgramSettings = {
  digitalEnabled: true,
  physicalEnabled: true,
  denominations: [25, 50, 100],
  physicalCodePrefix: "PGC",
};

export type GiftCardMetadata = {
  delivery: GiftCardDeliveryType;
  recipientEmail?: string;
  batchId?: string;
  printed?: boolean;
  label?: string;
};

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function parseGiftCardProgramSettings(raw: unknown): GiftCardProgramSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_GIFT_CARD_PROGRAM;
  const o = raw as Record<string, unknown>;
  const denominations = Array.isArray(o.denominations)
    ? o.denominations
        .map((d) => Math.round(num(d, 0)))
        .filter((d) => d > 0 && d <= 10_000)
        .slice(0, 8)
    : DEFAULT_GIFT_CARD_PROGRAM.denominations;
  const prefix =
    typeof o.physicalCodePrefix === "string" && o.physicalCodePrefix.trim()
      ? o.physicalCodePrefix.trim().toUpperCase().slice(0, 6)
      : DEFAULT_GIFT_CARD_PROGRAM.physicalCodePrefix;
  return {
    digitalEnabled:
      typeof o.digitalEnabled === "boolean"
        ? o.digitalEnabled
        : DEFAULT_GIFT_CARD_PROGRAM.digitalEnabled,
    physicalEnabled:
      typeof o.physicalEnabled === "boolean"
        ? o.physicalEnabled
        : DEFAULT_GIFT_CARD_PROGRAM.physicalEnabled,
    denominations: denominations.length > 0 ? denominations : DEFAULT_GIFT_CARD_PROGRAM.denominations,
    physicalCodePrefix: prefix,
  };
}

export function giftCardProgramFromSettingsCenter(settingsCenterJson: unknown): GiftCardProgramSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return DEFAULT_GIFT_CARD_PROGRAM;
  }
  const loyalty = (settingsCenterJson as Record<string, unknown>).loyalty;
  if (!loyalty || typeof loyalty !== "object") return DEFAULT_GIFT_CARD_PROGRAM;
  return parseGiftCardProgramSettings((loyalty as Record<string, unknown>).giftCards);
}

export function mergeGiftCardProgramIntoSettingsCenter(
  settingsCenterJson: unknown,
  program: GiftCardProgramSettings,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const loyalty =
    base.loyalty && typeof base.loyalty === "object"
      ? { ...(base.loyalty as Record<string, unknown>) }
      : {};
  loyalty.giftCards = program;
  base.loyalty = loyalty;
  return base;
}

export function encodeGiftCardNotes(meta: GiftCardMetadata, userNote?: string): string {
  const payload: Record<string, unknown> = { _gc: meta };
  if (userNote?.trim()) payload.note = userNote.trim();
  return JSON.stringify(payload);
}

export function parseGiftCardNotes(notes: string | null | undefined): {
  meta: GiftCardMetadata;
  userNote?: string;
} {
  if (!notes?.trim()) {
    return { meta: { delivery: "digital" } };
  }
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    if (parsed._gc && typeof parsed._gc === "object") {
      const gc = parsed._gc as Record<string, unknown>;
      const delivery = gc.delivery === "physical" ? "physical" : "digital";
      return {
        meta: {
          delivery,
          recipientEmail:
            typeof gc.recipientEmail === "string" ? gc.recipientEmail : undefined,
          batchId: typeof gc.batchId === "string" ? gc.batchId : undefined,
          printed: gc.printed === true,
          label: typeof gc.label === "string" ? gc.label : undefined,
        },
        userNote: typeof parsed.note === "string" ? parsed.note : undefined,
      };
    }
  } catch {
    /* legacy plain-text notes */
  }
  return { meta: { delivery: "digital" }, userNote: notes };
}
