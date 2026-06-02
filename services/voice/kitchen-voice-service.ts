import type {
  KitchenVoiceIntent,
  KitchenVoiceInventoryAnswer,
  KitchenVoiceQueryParse,
  KitchenVoiceQueryResult,
} from "@/lib/voice/kitchen-voice-types";
import { ingredientListWhereForOwner, recipeListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { loadVoiceSettings, verifyVoiceWebhookSecret } from "@/services/voice/voice-ordering-service";

export { verifyVoiceWebhookSecret };

const WAKE_PREFIX =
  /^(?:(?:alexa[, ]*)?(?:ask\s+)?os\s+kitchen[, ]*|(?:ok\s+google[, ]*|hey\s+google[, ]*))/i;

const INVENTORY_PATTERNS: Array<{ re: RegExp; locale: "en" | "ru" }> = [
  { re: /how much (.+?) (?:is )?(?:left|remaining)\??$/i, locale: "en" },
  { re: /how many (.+?) (?:are )?(?:left|remaining)\??$/i, locale: "en" },
  { re: /(?:what(?:'s| is) )?(?:left|remaining)(?: of)? (.+)\??$/i, locale: "en" },
  { re: /сколько (?:ещё |еще )?(?:осталось )?(.+?)\??$/i, locale: "ru" },
  { re: /осталось (.+?)\??$/i, locale: "ru" },
  { re: /сколько (.+?) осталось\??$/i, locale: "ru" },
];

function normalizeUtterance(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function stripWakePhrase(text: string): string {
  return text.replace(WAKE_PREFIX, "").trim();
}

function detectLocale(text: string): "en" | "ru" | "mixed" {
  if (/[а-яё]/i.test(text)) return "ru";
  return "en";
}

export function parseKitchenVoiceUtterance(utterance: string): KitchenVoiceQueryParse {
  const raw = normalizeUtterance(utterance);
  let text = stripWakePhrase(raw.toLowerCase());

  for (const { re, locale } of INVENTORY_PATTERNS) {
    const match = text.match(re);
    if (match?.[1]) {
      const phrase = match[1]
        .replace(/\b(у нас|на складе|в наличии)\b/gi, "")
        .replace(/\?+$/g, "")
        .trim();
      if (phrase.length >= 2) {
        return {
          intent: "inventory_remaining",
          ingredientPhrase: phrase,
          raw,
          locale,
        };
      }
    }
  }

  if (
    /\b(left|remaining|осталось|сколько)\b/i.test(text) &&
    text.length >= 8
  ) {
    const fallback = text
      .replace(/\b(how much|how many|сколько|осталось|left|remaining)\b/gi, "")
      .replace(/\?+$/g, "")
      .trim();
    if (fallback.length >= 2) {
      return {
        intent: "inventory_remaining",
        ingredientPhrase: fallback,
        raw,
        locale: detectLocale(text),
      };
    }
  }

  return {
    intent: "unknown",
    ingredientPhrase: "",
    raw,
    locale: detectLocale(text),
  };
}

export function servingsFromStock(
  stock: number,
  ingredientQtyPerBatch: number,
  yieldQuantity: number,
): number | null {
  if (stock <= 0 || ingredientQtyPerBatch <= 0 || yieldQuantity <= 0) return 0;
  const perServing = ingredientQtyPerBatch / yieldQuantity;
  if (perServing <= 0) return null;
  return Math.max(0, Math.floor(stock / perServing));
}

function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

function formatDisplayWeight(stock: number, unit: string): string | null {
  const u = unit.toLowerCase();
  if (u === "kg" || u === "kilogram" || u === "kilograms") {
    return `${Math.round(stock * 10) / 10} kg`;
  }
  if (u === "g" || u === "gram" || u === "grams") {
    return `${Math.round((stock / 1000) * 10) / 10} kg`;
  }
  if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") {
    return `${Math.round(stock * 10) / 10} lb`;
  }
  return `${Math.round(stock * 10) / 10} ${unit}`;
}

async function matchIngredient(ownerUserId: string, phrase: string) {
  const where = await ingredientListWhereForOwner(ownerUserId);
  const ingredients = await prisma.ingredient.findMany({
    where,
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      parLevel: true,
    },
    take: 300,
  });

  const q = phrase.toLowerCase().trim();
  const scored = ingredients
    .map((ing) => {
      const name = ing.name.toLowerCase();
      let score = 0;
      if (name === q) score = 100;
      else if (name.includes(q) || q.includes(name)) score = 85;
      else {
        const tokens = q.split(/\s+/).filter((t) => t.length > 2);
        score = tokens.filter((t) => name.includes(t)).length * 20;
      }
      return { ing, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.ing ?? null;
}

async function estimateBowls(
  ownerUserId: string,
  ingredientId: string,
  stock: number,
): Promise<{ bowls: number | null; productTitle: string | null }> {
  const recipeWhere = await recipeListWhereForOwner(ownerUserId);
  const lines = await prisma.recipeIngredient.findMany({
    where: {
      ingredientId,
      recipe: { AND: [recipeWhere, { active: true }] },
    },
    include: {
      recipe: {
        select: {
          yieldQuantity: true,
          product: { select: { title: true } },
        },
      },
    },
    take: 20,
  });

  if (lines.length === 0) return { bowls: null, productTitle: null };

  const bowlLine =
    lines.find((l) => /bowl|боул/i.test(l.recipe.product.title)) ?? lines[0]!;

  const qty = decimalToNumber(bowlLine.quantity);
  const yieldQty = decimalToNumber(bowlLine.recipe.yieldQuantity);
  const bowls = servingsFromStock(stock, qty, yieldQty);

  return {
    bowls,
    productTitle: bowlLine.recipe.product.title,
  };
}

function buildSpeech(answer: KitchenVoiceInventoryAnswer, locale: KitchenVoiceQueryParse["locale"]): string {
  const weight = answer.displayWeight;
  const bowls = answer.bowls;
  const name = answer.ingredientName;

  if (locale === "ru") {
    const parts: string[] = [];
    if (weight) parts.push(weight.replace("kg", "кг"));
    if (bowls != null) parts.push(`${bowls} боулов`);
    const body = parts.length ? parts.join(", ") : `${answer.stock} ${answer.unit}`;
    const par = answer.belowPar ? " Ниже par — пора заказывать." : "";
    return `Осталось ${body} ${name}.${par}`;
  }

  const parts: string[] = [];
  if (weight) parts.push(weight);
  if (bowls != null) parts.push(`${bowls} bowls`);
  const body = parts.length ? parts.join(" and ") : `${answer.stock} ${answer.unit}`;
  const par = answer.belowPar ? " Below par — consider reordering." : "";
  return `You have ${body} of ${name}.${par}`;
}

export async function answerKitchenInventoryQuery(
  ownerUserId: string,
  parse: KitchenVoiceQueryParse,
): Promise<KitchenVoiceQueryResult> {
  if (parse.intent !== "inventory_remaining" || !parse.ingredientPhrase) {
    return {
      ok: false,
      reason: "unknown_intent",
      speech:
        parse.locale === "ru"
          ? "Спросите, например: «OS Kitchen, сколько осталось курицы?»"
          : 'Try asking, "OS Kitchen, how much chicken is left?"',
    };
  }

  const ingredient = await matchIngredient(ownerUserId, parse.ingredientPhrase);
  if (!ingredient) {
    return {
      ok: false,
      reason: "ingredient_not_found",
      speech:
        parse.locale === "ru"
          ? `Не нашёл ингредиент «${parse.ingredientPhrase}» в вашем складе.`
          : `I could not find an ingredient matching "${parse.ingredientPhrase}".`,
    };
  }

  const stock = decimalToNumber(ingredient.currentStock);
  const parLevel = decimalToNumber(ingredient.parLevel);
  const { bowls, productTitle } = await estimateBowls(ownerUserId, ingredient.id, stock);

  const answer: KitchenVoiceInventoryAnswer = {
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    stock,
    unit: ingredient.unit,
    displayWeight: formatDisplayWeight(stock, ingredient.unit),
    bowls,
    bowlProductTitle: productTitle,
    parLevel: parLevel > 0 ? parLevel : null,
    belowPar: parLevel > 0 && stock < parLevel,
  };

  return {
    ok: true,
    speech: buildSpeech(answer, parse.locale),
    answer,
  };
}

export async function processKitchenVoiceQuery(input: {
  ownerUserId: string;
  utterance?: string;
  slots?: { ingredient?: string };
}): Promise<KitchenVoiceQueryResult | null> {
  const settings = await loadVoiceSettings(input.ownerUserId);
  if (!settings.enabled) {
    return {
      ok: false,
      reason: "voice_disabled",
      speech: "Voice is disabled in settings. Enable it under Settings → Voice ordering.",
    };
  }

  const utterance =
    input.utterance?.trim() ||
    (input.slots?.ingredient ? `how much ${input.slots.ingredient} is left` : "");
  if (!utterance) return null;

  const parsed = parseKitchenVoiceUtterance(utterance);
  if (parsed.intent === "unknown") return null;

  return answerKitchenInventoryQuery(input.ownerUserId, parsed);
}

export function isKitchenVoiceIntent(intent: KitchenVoiceIntent): boolean {
  return intent === "inventory_remaining";
}
