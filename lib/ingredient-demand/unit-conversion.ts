export type ConversionJson = Record<string, number> | null | undefined;

export type ConvertResult =
  | { ok: true; value: number }
  | { ok: false; code: "MISSING_CONVERSION" | "UNSUPPORTED_PAIR" | "INVALID_JSON"; message: string };

const ALIASES: Record<string, string> = {
  gram: "g",
  grams: "g",
  kilogram: "kg",
  kilograms: "kg",
  ounce: "oz",
  ounces: "oz",
  pound: "lb",
  pounds: "lb",
  liter: "l",
  litre: "l",
  milliliter: "ml",
  millilitre: "ml",
  floz: "fl oz",
  "fl. oz": "fl oz",
  tablespoon: "tbsp",
  teaspoons: "tsp",
  teaspoon: "tsp",
  each: "each",
  unit: "each",
};

export function normalizeUnit(u: string): string {
  const t = u.trim().toLowerCase();
  return ALIASES[t] ?? t;
}

/** Same-dimension conversions we can apply without density assumptions. */
const WEIGHT_TO_G: Record<string, number> = { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 };
const VOL_TO_ML: Record<string, number> = { ml: 1, l: 1000, "fl oz": 29.5735295625 };

function weightFamily(u: string): boolean {
  return u in WEIGHT_TO_G;
}

function volumeFamily(u: string): boolean {
  return u in VOL_TO_ML;
}

function readPairFromJson(
  from: string,
  to: string,
  conversionJson: ConversionJson,
): number | null {
  if (!conversionJson || typeof conversionJson !== "object") return null;
  const keyDirect = `${from}->${to}`;
  const keyRev = `${to}->${from}`;
  if (typeof conversionJson[keyDirect] === "number" && conversionJson[keyDirect]! > 0) {
    return conversionJson[keyDirect]!;
  }
  if (typeof conversionJson[keyRev] === "number" && conversionJson[keyRev]! > 0) {
    return 1 / conversionJson[keyRev]!;
  }
  return null;
}

/**
 * Convert quantity expressed in `fromUnit` into `toUnit` for one ingredient.
 * Never silently crosses mass ↔ volume without explicit JSON ratio on the ingredient.
 */
export function convertIngredientQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  conversionJson: ConversionJson,
): ConvertResult {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (from === to) return { ok: true, value: quantity };

  const custom = readPairFromJson(from, to, conversionJson);
  if (custom != null) return { ok: true, value: quantity * custom };

  if (weightFamily(from) && weightFamily(to)) {
    const g = quantity * WEIGHT_TO_G[from]!;
    return { ok: true, value: g / WEIGHT_TO_G[to]! };
  }
  if (volumeFamily(from) && volumeFamily(to)) {
    const ml = quantity * VOL_TO_ML[from]!;
    return { ok: true, value: ml / VOL_TO_ML[to]! };
  }

  if (weightFamily(from) && volumeFamily(to)) {
    return {
      ok: false,
      code: "MISSING_CONVERSION",
      message: `Mass ↔ volume (${from} → ${to}) needs an explicit conversion on the ingredient — density is not assumed.`,
    };
  }
  if (volumeFamily(from) && weightFamily(to)) {
    return {
      ok: false,
      code: "MISSING_CONVERSION",
      message: `Volume ↔ mass (${from} → ${to}) needs an explicit conversion on the ingredient — density is not assumed.`,
    };
  }

  return {
    ok: false,
    code: "UNSUPPORTED_PAIR",
    message: `No built-in conversion for ${from} → ${to}. Add a ratio to ingredient conversion JSON.`,
  };
}
