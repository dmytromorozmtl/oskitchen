import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  ALLOWED_PRODUCTION_CRON_SLUGS,
  isAllowedProductionCronSlug,
  isExperimentalCronSlug,
} from "@/services/cron/production-manifest";
import { listCronRouteSlugsFromDisk } from "@/services/cron/cron-route-inventory";

export const CRON_ACTIVE_ROOT = join(process.cwd(), "app/api/cron");
export const CRON_ARCHIVE_ROOT = join(process.cwd(), "archive/cron-routes");
export const CRON_ARCHIVE_MANIFEST_PATH = join(process.cwd(), "config/cron-archive-manifest.json");

export type CronArchiveManifest = {
  version: 1;
  /** Relative to repo root */
  archiveRoot: string;
  /** ISO timestamp of last archive operation */
  archivedAt: string | null;
  slugs: string[];
};

export type CronArchiveOperationResult = {
  dryRun: boolean;
  moved: string[];
  skipped: string[];
  errors: { slug: string; message: string }[];
};

function defaultManifest(): CronArchiveManifest {
  return {
    version: 1,
    archiveRoot: "archive/cron-routes",
    archivedAt: null,
    slugs: [],
  };
}

export function readCronArchiveManifest(): CronArchiveManifest {
  if (!existsSync(CRON_ARCHIVE_MANIFEST_PATH)) return defaultManifest();
  const raw = JSON.parse(readFileSync(CRON_ARCHIVE_MANIFEST_PATH, "utf8")) as CronArchiveManifest;
  return {
    version: 1,
    archiveRoot: raw.archiveRoot ?? "archive/cron-routes",
    archivedAt: raw.archivedAt ?? null,
    slugs: Array.isArray(raw.slugs) ? [...raw.slugs].sort() : [],
  };
}

export function writeCronArchiveManifest(manifest: CronArchiveManifest): void {
  const normalized: CronArchiveManifest = {
    version: 1,
    archiveRoot: manifest.archiveRoot,
    archivedAt: manifest.archivedAt,
    slugs: [...new Set(manifest.slugs)].sort(),
  };
  writeFileSync(CRON_ARCHIVE_MANIFEST_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

export function listArchivedCronSlugsFromDisk(): string[] {
  if (!existsSync(CRON_ARCHIVE_ROOT)) return [];
  return readdirSync(CRON_ARCHIVE_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .filter((d) => existsSync(join(CRON_ARCHIVE_ROOT, d.name, "route.ts")))
    .map((d) => d.name)
    .sort();
}

function activeCronDir(slug: string): string {
  return join(CRON_ACTIVE_ROOT, slug);
}

function archivedCronDir(slug: string): string {
  return join(CRON_ARCHIVE_ROOT, slug);
}

export function resolveSlugsToArchive(requested?: string[]): string[] {
  const active = new Set(listCronRouteSlugsFromDisk());
  const manifest = readCronArchiveManifest();
  const archived = new Set(manifest.slugs);

  if (requested?.length) {
    return requested.map((s) => s.trim()).filter(Boolean).sort();
  }

  return [...active].filter((slug) => isExperimentalCronSlug(slug) && !archived.has(slug)).sort();
}

export function resolveSlugsToRestore(requested?: string[]): string[] {
  const manifest = readCronArchiveManifest();
  const onDisk = new Set(listArchivedCronSlugsFromDisk());
  const candidates = requested?.length
    ? requested.map((s) => s.trim()).filter(Boolean)
    : manifest.slugs.filter((s) => onDisk.has(s));
  return [...new Set(candidates)].sort();
}

export function archiveExperimentalCronSlugs(options: {
  slugs?: string[];
  dryRun: boolean;
}): CronArchiveOperationResult {
  const result: CronArchiveOperationResult = {
    dryRun: options.dryRun,
    moved: [],
    skipped: [],
    errors: [],
  };

  const slugs = resolveSlugsToArchive(options.slugs);
  const manifest = readCronArchiveManifest();

  for (const slug of slugs) {
    if (isAllowedProductionCronSlug(slug)) {
      result.errors.push({ slug, message: "production allowlist slug cannot be archived" });
      continue;
    }
    if (!isExperimentalCronSlug(slug)) {
      result.errors.push({ slug, message: "not classified as experimental" });
      continue;
    }

    const from = activeCronDir(slug);
    const to = archivedCronDir(slug);

    if (!existsSync(from)) {
      if (existsSync(to)) {
        result.skipped.push(slug);
        if (!manifest.slugs.includes(slug)) manifest.slugs.push(slug);
      } else {
        result.errors.push({ slug, message: "active route folder not found" });
      }
      continue;
    }

    if (existsSync(to)) {
      result.errors.push({ slug, message: "archive destination already exists" });
      continue;
    }

    if (!options.dryRun) {
      mkdirSync(CRON_ARCHIVE_ROOT, { recursive: true });
      renameSync(from, to);
      if (!manifest.slugs.includes(slug)) manifest.slugs.push(slug);
    }
    result.moved.push(slug);
  }

  if (!options.dryRun && result.moved.length > 0) {
    manifest.archivedAt = new Date().toISOString();
    writeCronArchiveManifest(manifest);
  }

  return result;
}

export function restoreArchivedCronSlugs(options: {
  slugs?: string[];
  dryRun: boolean;
}): CronArchiveOperationResult {
  const result: CronArchiveOperationResult = {
    dryRun: options.dryRun,
    moved: [],
    skipped: [],
    errors: [],
  };

  const slugs = resolveSlugsToRestore(options.slugs);
  const manifest = readCronArchiveManifest();

  for (const slug of slugs) {
    const from = archivedCronDir(slug);
    const to = activeCronDir(slug);

    if (!existsSync(from)) {
      result.errors.push({ slug, message: "archived route folder not found" });
      continue;
    }
    if (existsSync(to)) {
      result.skipped.push(slug);
      continue;
    }

    if (!options.dryRun) {
      mkdirSync(CRON_ACTIVE_ROOT, { recursive: true });
      renameSync(from, to);
      manifest.slugs = manifest.slugs.filter((s) => s !== slug);
    }
    result.moved.push(slug);
  }

  if (!options.dryRun && result.moved.length > 0) {
    manifest.archivedAt = manifest.slugs.length ? manifest.archivedAt : null;
    writeCronArchiveManifest(manifest);
  }

  return result;
}

export function cronArchiveStatus(): {
  activeTotal: number;
  activeProduction: number;
  activeExperimental: number;
  archivedTotal: number;
  manifestSlugs: number;
} {
  const active = listCronRouteSlugsFromDisk();
  const archived = listArchivedCronSlugsFromDisk();
  const manifest = readCronArchiveManifest();
  return {
    activeTotal: active.length,
    activeProduction: active.filter((s) => isAllowedProductionCronSlug(s)).length,
    activeExperimental: active.filter((s) => isExperimentalCronSlug(s)).length,
    archivedTotal: archived.length,
    manifestSlugs: manifest.slugs.length,
  };
}

/** Guard: production routes must remain under app/api/cron */
export function missingProductionCronsOnDisk(): string[] {
  const active = new Set(listCronRouteSlugsFromDisk());
  return ALLOWED_PRODUCTION_CRON_SLUGS.filter((slug) => !active.has(slug));
}
