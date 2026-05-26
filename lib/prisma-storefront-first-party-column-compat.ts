import type { PrismaClient } from "@prisma/client";

/**
 * When `first_party_analytics_mode` exists in Prisma schema but the physical
 * column is missing (migrate deploy / repair SQL not applied yet), default
 * Prisma reads/writes fail. This extension makes queries resilient until
 * `npm run db:deploy` or `npm run db:repair-storefront` adds the column.
 */
let storefrontFirstPartyColumnPresent: boolean | undefined;

export function resetStorefrontFirstPartyColumnProbeForTests() {
  storefrontFirstPartyColumnPresent = undefined;
}

async function getStorefrontFirstPartyColumnPresent(base: PrismaClient): Promise<boolean> {
  if (storefrontFirstPartyColumnPresent !== undefined) {
    return storefrontFirstPartyColumnPresent;
  }
  try {
    const rows = await base.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'storefront_settings'
          AND column_name = 'first_party_analytics_mode'
      ) AS "exists"`;
    storefrontFirstPartyColumnPresent = Boolean(rows[0]?.exists);
  } catch {
    storefrontFirstPartyColumnPresent = true;
  }
  return storefrontFirstPartyColumnPresent;
}

function stripFirstPartyFromData(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const d = data as Record<string, unknown>;
  if (!("firstPartyAnalyticsMode" in d)) return data;
  const { firstPartyAnalyticsMode: _removed, ...rest } = d;
  void _removed;
  return rest;
}

function patchMutationArgsWhenColumnMissing(
  args: Record<string, unknown> | undefined,
  opts: { omitResult: boolean }
): Record<string, unknown> | undefined {
  if (!args) return args;
  const next: Record<string, unknown> = { ...args };

  if (next.data !== undefined) {
    if (Array.isArray(next.data)) {
      next.data = next.data.map((row) => stripFirstPartyFromData(row));
    } else {
      next.data = stripFirstPartyFromData(next.data);
    }
  }
  if (next.create !== undefined) {
    next.create = stripFirstPartyFromData(next.create);
  }
  if (next.update !== undefined) {
    next.update = stripFirstPartyFromData(next.update);
  }
  if (opts.omitResult) {
    next.omit = { ...((next.omit as object) ?? {}), firstPartyAnalyticsMode: true };
  }
  return next;
}

/** Prisma batch payloads and other non-row results must not receive synthetic fields. */
function shouldInjectFirstPartyDefault(result: unknown): boolean {
  if (result == null) return false;
  if (Array.isArray(result)) {
    return result.length > 0 && shouldInjectFirstPartyDefault(result[0]);
  }
  if (typeof result !== "object") return false;
  const o = result as Record<string, unknown>;
  if ("count" in o && typeof o.count === "number" && !("id" in o)) {
    return false;
  }
  return "storeSlug" in o || ("userId" in o && "publicName" in o);
}

function injectDefaultFirstPartyMode<T>(result: T): T {
  if (!shouldInjectFirstPartyDefault(result)) return result;
  if (Array.isArray(result)) {
    return result.map((row) => injectIntoRow(row)) as T;
  }
  return injectIntoRow(result) as T;
}

function injectIntoRow(row: unknown): unknown {
  if (row === null || typeof row !== "object") return row;
  const o = row as Record<string, unknown>;
  if ("firstPartyAnalyticsMode" in o) return row;
  return { ...o, firstPartyAnalyticsMode: "ALWAYS_ON" };
}

async function storefrontFindHandler<A extends Record<string, unknown>, R>(
  base: PrismaClient,
  args: A,
  query: (args: A) => Promise<R>
): Promise<R> {
  const present = await getStorefrontFirstPartyColumnPresent(base);
  if (present) return query(args);

  let nextArgs = args;
  let injectDefault = false;

  if (args?.select && typeof args.select === "object") {
    if ("firstPartyAnalyticsMode" in args.select) {
      const { firstPartyAnalyticsMode: _fp, ...rest } = args.select as Record<string, unknown>;
      void _fp;
      nextArgs = { ...args, select: rest } as A;
      injectDefault = true;
    }
  } else if (!args?.select) {
    nextArgs = {
      ...args,
      omit: { ...((args?.omit as object) ?? {}), firstPartyAnalyticsMode: true },
    } as A;
    injectDefault = true;
  }

  const result = await query(nextArgs);
  if (!injectDefault) return result;
  return injectDefaultFirstPartyMode(result);
}

async function storefrontMutationHandler<A>(
  base: PrismaClient,
  args: A,
  query: (args: A) => Promise<unknown>,
  opts: { omitResult: boolean }
): Promise<unknown> {
  const present = await getStorefrontFirstPartyColumnPresent(base);
  if (present) return query(args);
  const patched = patchMutationArgsWhenColumnMissing(args as Record<string, unknown>, opts) as A;
  const r = await query(patched);
  return injectDefaultFirstPartyMode(r);
}

export function storefrontFirstPartyColumnCompatExtension(base: PrismaClient) {
  return {
    query: {
      storefrontSettings: {
        findUnique({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontFindHandler(base, args, query as (a: typeof args) => Promise<unknown>);
        },
        findUniqueOrThrow({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontFindHandler(base, args, query as (a: typeof args) => Promise<unknown>);
        },
        findFirst({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontFindHandler(base, args, query as (a: typeof args) => Promise<unknown>);
        },
        findFirstOrThrow({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontFindHandler(base, args, query as (a: typeof args) => Promise<unknown>);
        },
        findMany({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontFindHandler(base, args, query as (a: typeof args) => Promise<unknown>);
        },
        create({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: true,
          });
        },
        createMany({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: false,
          });
        },
        createManyAndReturn({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: true,
          });
        },
        update({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: true,
          });
        },
        updateMany({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: false,
          });
        },
        updateManyAndReturn({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: true,
          });
        },
        upsert({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) {
          return storefrontMutationHandler(base, args, query as (a: typeof args) => Promise<unknown>, {
            omitResult: true,
          });
        },
      },
    },
  };
}
