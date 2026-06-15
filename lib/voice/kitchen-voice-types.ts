export type KitchenVoiceIntent = "inventory_remaining" | "unknown";

export type KitchenVoiceQueryParse = {
  intent: KitchenVoiceIntent;
  ingredientPhrase: string;
  raw: string;
  locale: "en" | "ru" | "mixed";
};

export type KitchenVoiceInventoryAnswer = {
  ingredientId: string;
  ingredientName: string;
  stock: number;
  unit: string;
  displayWeight: string | null;
  bowls: number | null;
  bowlProductTitle: string | null;
  parLevel: number | null;
  belowPar: boolean;
};

export type KitchenVoiceQueryResult =
  | { ok: true; speech: string; answer: KitchenVoiceInventoryAnswer }
  | { ok: false; speech: string; reason: string };
