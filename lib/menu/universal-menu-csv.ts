import type { UniversalMenuItem, UniversalMenuItemUpdate } from "@/lib/menu/universal-menu-types";
import { MENU_CHANNELS } from "@/lib/menu/universal-menu-types";

const CSV_HEADERS = [
  "productId",
  "title",
  "price",
  "category",
  "active",
  ...MENU_CHANNELS.map((c) => `${c}_enabled`),
  ...MENU_CHANNELS.filter((c) => ["shopify", "uberEats", "doordash", "grubhub"].includes(c)).map(
    (c) => `${c}_externalId`,
  ),
  ...MENU_CHANNELS.map((c) => `${c}_title`),
  ...MENU_CHANNELS.map((c) => `${c}_price`),
] as const;

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export type UniversalMenuCsvRow = {
  productId: string;
  title?: string;
  price?: number;
  category?: string;
  active?: boolean;
  channelEnabled: Partial<Record<(typeof MENU_CHANNELS)[number], boolean>>;
  channelExternalIds: Partial<Record<(typeof MENU_CHANNELS)[number], string | null>>;
  channelTitles: Partial<Record<(typeof MENU_CHANNELS)[number], string>>;
  channelPrices: Partial<Record<(typeof MENU_CHANNELS)[number], number>>;
};

export function exportUniversalMenuCsv(items: UniversalMenuItem[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const item of items) {
    const row: string[] = [
      item.productId,
      item.master.title,
      String(item.master.price),
      item.master.category,
      item.master.active ? "true" : "false",
    ];

    for (const channel of MENU_CHANNELS) {
      const override = item.channelOverrides[channel];
      const enabled =
        override.enabled !== undefined
          ? override.enabled
          : channel === "pos"
            ? item.master.posVisible
            : channel === "website"
              ? item.master.storefrontVisible
              : item.master.active;
      row.push(enabled ? "true" : "false");
    }

    for (const channel of ["shopify", "uberEats", "doordash", "grubhub"] as const) {
      row.push(item.channelOverrides[channel].externalId ?? "");
    }

    for (const channel of MENU_CHANNELS) {
      row.push(item.channelOverrides[channel].title ?? "");
    }

    for (const channel of MENU_CHANNELS) {
      const p = item.channelOverrides[channel].price;
      row.push(p != null ? String(p) : "");
    }

    lines.push(row.map((v) => escapeCsv(v)).join(","));
  }

  return lines.join("\n");
}

export function parseUniversalMenuCsv(text: string): { rows: UniversalMenuCsvRow[]; errors: string[] } {
  const errors: string[] = [];
  const trimmed = text.trim();
  if (!trimmed) return { rows: [], errors: ["CSV is empty."] };

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], errors: ["CSV must include a header row and at least one data row."] };

  const header = parseCsvLine(lines[0]!);
  const idx = (name: string) => header.indexOf(name);

  const rows: UniversalMenuCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    const productId = cols[idx("productId")]?.trim();
    if (!productId) {
      errors.push(`Row ${i + 1}: missing productId`);
      continue;
    }

    const channelEnabled: UniversalMenuCsvRow["channelEnabled"] = {};
    for (const channel of MENU_CHANNELS) {
      const raw = cols[idx(`${channel}_enabled`)]?.trim().toLowerCase();
      if (raw === "true" || raw === "false") channelEnabled[channel] = raw === "true";
    }

    const channelExternalIds: UniversalMenuCsvRow["channelExternalIds"] = {};
    for (const channel of ["shopify", "uberEats", "doordash", "grubhub"] as const) {
      const raw = cols[idx(`${channel}_externalId`)]?.trim();
      if (raw) channelExternalIds[channel] = raw;
    }

    const channelTitles: UniversalMenuCsvRow["channelTitles"] = {};
    const channelPrices: UniversalMenuCsvRow["channelPrices"] = {};
    for (const channel of MENU_CHANNELS) {
      const t = cols[idx(`${channel}_title`)]?.trim();
      if (t) channelTitles[channel] = t;
      const p = cols[idx(`${channel}_price`)]?.trim();
      if (p && !Number.isNaN(Number(p))) channelPrices[channel] = Number(p);
    }

    const priceRaw = cols[idx("price")]?.trim();
    const activeRaw = cols[idx("active")]?.trim().toLowerCase();

    rows.push({
      productId,
      title: cols[idx("title")]?.trim() || undefined,
      price: priceRaw && !Number.isNaN(Number(priceRaw)) ? Number(priceRaw) : undefined,
      category: cols[idx("category")]?.trim() || undefined,
      active: activeRaw === "true" || activeRaw === "false" ? activeRaw === "true" : undefined,
      channelEnabled,
      channelExternalIds,
      channelTitles,
      channelPrices,
    });
  }

  return { rows, errors };
}

export function csvRowToItemUpdate(row: UniversalMenuCsvRow): UniversalMenuItemUpdate {
  const channelOverrides: Partial<
    Record<(typeof MENU_CHANNELS)[number], import("@/lib/menu/universal-menu-types").ChannelItemOverride>
  > = {};

  for (const channel of MENU_CHANNELS) {
    const patch: import("@/lib/menu/universal-menu-types").ChannelItemOverride = {};
    if (row.channelEnabled[channel] !== undefined) patch.enabled = row.channelEnabled[channel];
    if (row.channelTitles[channel]) patch.title = row.channelTitles[channel];
    if (row.channelPrices[channel] != null) patch.price = row.channelPrices[channel];
    if (row.channelExternalIds[channel] !== undefined) {
      patch.externalId = row.channelExternalIds[channel];
    }
    if (Object.keys(patch).length > 0) channelOverrides[channel] = patch;
  }

  return {
    master: {
      ...(row.title ? { title: row.title } : {}),
      ...(row.price != null ? { price: row.price } : {}),
      ...(row.category ? { category: row.category } : {}),
      ...(row.active != null ? { active: row.active } : {}),
    },
    channelOverrides,
    pushToChannels: false,
  };
}
