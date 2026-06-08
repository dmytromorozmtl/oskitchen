import type { PrismaClient } from "@prisma/client";

/**
 * When `demo_expires_at` is in Prisma schema but not yet migrated on the DB,
 * default reads fail. Omit the column until migrate deploy / repair SQL applies.
 */
let kitchenDemoExpiresColumnPresent: boolean | undefined;

export function resetKitchenDemoExpiresColumnProbeForTests() {
  kitchenDemoExpiresColumnPresent = undefined;
}

async function getKitchenDemoExpiresColumnPresent(base: PrismaClient): Promise<boolean> {
  if (kitchenDemoExpiresColumnPresent !== undefined) {
    return kitchenDemoExpiresColumnPresent;
  }
  try {
    const rows = await base.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'kitchen_settings'
          AND column_name = 'demo_expires_at'
      ) AS "exists"`,
    );
    kitchenDemoExpiresColumnPresent = Boolean(rows[0]?.exists);
  } catch {
    kitchenDemoExpiresColumnPresent = true;
  }
  return kitchenDemoExpiresColumnPresent;
}

function stripDemoExpiresFromData(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const d = data as Record<string, unknown>;
  if (!("demoExpiresAt" in d)) return data;
  const { demoExpiresAt: _removed, ...rest } = d;
  void _removed;
  return rest;
}

function patchMutationArgsWhenColumnMissing(
  args: Record<string, unknown> | undefined,
  opts: { omitResult: boolean },
): Record<string, unknown> | undefined {
  if (!args) return args;
  const next: Record<string, unknown> = { ...args };

  if (next.data !== undefined) {
    if (Array.isArray(next.data)) {
      next.data = next.data.map((row) => stripDemoExpiresFromData(row));
    } else {
      next.data = stripDemoExpiresFromData(next.data);
    }
  }
  if (next.create !== undefined) {
    next.create = stripDemoExpiresFromData(next.create);
  }
  if (next.update !== undefined) {
    next.update = stripDemoExpiresFromData(next.update);
  }
  if (opts.omitResult) {
    next.omit = { ...((next.omit as object) ?? {}), demoExpiresAt: true };
  }
  return next;
}

function shouldInjectDemoExpiresDefault(result: unknown): boolean {
  if (result == null) return false;
  if (Array.isArray(result)) {
    return result.length > 0 && shouldInjectDemoExpiresDefault(result[0]);
  }
  if (typeof result !== "object") return false;
  const o = result as Record<string, unknown>;
  if ("count" in o && typeof o.count === "number" && !("userId" in o)) {
    return false;
  }
  return "userId" in o || "businessName" in o || "demoMode" in o;
}

function injectDefaultDemoExpires<T>(result: T): T {
  if (!shouldInjectDemoExpiresDefault(result)) return result;
  if (Array.isArray(result)) {
    return result.map((row) => injectIntoRow(row)) as T;
  }
  return injectIntoRow(result) as T;
}

function injectIntoRow(row: unknown): unknown {
  if (row === null || typeof row !== "object") return row;
  const o = row as Record<string, unknown>;
  if ("demoExpiresAt" in o) return row;
  return { ...o, demoExpiresAt: null };
}

async function kitchenSettingsFindHandler<A extends Record<string, unknown>, R>(
  base: PrismaClient,
  args: A,
  query: (args: A) => Promise<R>,
): Promise<R> {
  const present = await getKitchenDemoExpiresColumnPresent(base);
  if (present) return query(args);

  let nextArgs = args;
  let injectDefault = false;

  if (args?.select && typeof args.select === "object") {
    if ("demoExpiresAt" in args.select) {
      const { demoExpiresAt: _demo, ...rest } = args.select as Record<string, unknown>;
      void _demo;
      nextArgs = { ...args, select: rest } as A;
      injectDefault = true;
    }
  } else if (!args?.select) {
    nextArgs = {
      ...args,
      omit: { ...((args?.omit as object) ?? {}), demoExpiresAt: true },
    } as A;
    injectDefault = true;
  }

  const result = await query(nextArgs);
  if (!injectDefault) return result;
  return injectDefaultDemoExpires(result);
}

async function kitchenSettingsMutationHandler<A>(
  base: PrismaClient,
  args: A,
  query: (args: A) => Promise<unknown>,
  opts: { omitResult: boolean },
): Promise<unknown> {
  const present = await getKitchenDemoExpiresColumnPresent(base);
  if (present) return query(args);
  const patched = patchMutationArgsWhenColumnMissing(args as Record<string, unknown>, opts) as A;
  const r = await query(patched);
  return injectDefaultDemoExpires(r);
}

export function kitchenSettingsDemoExpiresColumnCompatExtension(base: PrismaClient) {
  const wrapFind =
    () =>
    ({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) =>
      kitchenSettingsFindHandler(base, args, query as (a: typeof args) => Promise<unknown>);

  const wrapMutation =
    (opts: { omitResult: boolean }) =>
    ({ args, query }: { args: Record<string, unknown>; query: (a: unknown) => Promise<unknown> }) =>
      kitchenSettingsMutationHandler(base, args, query, opts);

  return {
    query: {
      kitchenSettings: {
        findUnique: wrapFind(),
        findUniqueOrThrow: wrapFind(),
        findFirst: wrapFind(),
        findFirstOrThrow: wrapFind(),
        findMany: wrapFind(),
        create: wrapMutation({ omitResult: true }),
        createMany: wrapMutation({ omitResult: false }),
        createManyAndReturn: wrapMutation({ omitResult: true }),
        update: wrapMutation({ omitResult: true }),
        updateMany: wrapMutation({ omitResult: false }),
        updateManyAndReturn: wrapMutation({ omitResult: true }),
        upsert: wrapMutation({ omitResult: true }),
      },
    },
  };
}
