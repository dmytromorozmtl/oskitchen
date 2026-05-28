import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  PUBLIC_API_V1_RESOURCES,
  type PublicApiV1HttpMethod,
} from "@/lib/api-public/public-api-v1-registry";

import manifest from "./openapi-manifest.json";

export type ApiRouteEntry = {
  path: string;
  methods: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[];
  tag: string;
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function publicApiV1Operation(
  method: PublicApiV1HttpMethod,
  path: string,
  tag: string,
): Record<string, unknown> {
  return {
    tags: [tag],
    summary: `${method} ${path}`,
    operationId: `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, "_")}`,
    security: [{ bearerApiKey: [] }],
    responses: {
      "200": { description: "Success" },
      "400": { description: "Invalid request body (POST routes)" },
      "401": { description: "Unauthorized — invalid or unentitled API key" },
      "429": { description: "Rate limit exceeded — Retry-After header set" },
      "503": { description: "Rate limiting misconfigured — fail-closed" },
    },
  };
}

function applyPublicApiV1Paths(paths: Record<string, Record<string, unknown>>): void {
  for (const resource of PUBLIC_API_V1_RESOURCES) {
    paths[resource.path] = {};
    for (const method of resource.methods) {
      paths[resource.path][method.toLowerCase()] = publicApiV1Operation(
        method,
        resource.path,
        "public",
      );
    }
  }
}

function collectRouteFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectRouteFiles(full, acc);
    else if (name === "route.ts") acc.push(full);
  }
  return acc;
}

function filePathToApiPath(file: string, apiRoot: string): string {
  const rel = relative(apiRoot, file).replace(/\\/g, "/");
  const withoutRoute = rel.replace(/\/route\.ts$/, "");
  const segments = withoutRoute.split("/").map((seg) => {
    if (seg.startsWith("[") && seg.endsWith("]")) {
      const inner = seg.slice(1, -1);
      if (inner.startsWith("...")) return `{${inner.slice(3)}}`;
      return `{${inner}}`;
    }
    return seg;
  });
  return `/api/${segments.join("/")}`;
}

function tagFromPath(apiPath: string): string {
  const parts = apiPath.replace(/^\/api\/?/, "").split("/");
  return parts[0] || "root";
}

function listApiPaths(): string[] {
  const apiRoot = join(process.cwd(), "app", "api");
  try {
    if (statSync(apiRoot).isDirectory()) {
      return collectRouteFiles(apiRoot)
        .map((file) => filePathToApiPath(file, apiRoot))
        .sort();
    }
  } catch {
    /* serverless — no source tree */
  }

  if (manifest.routes?.length) {
    return manifest.routes;
  }

  const manifestPath = join(process.cwd(), "lib", "api", "openapi-manifest.json");
  try {
    const parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as { routes?: string[] };
    return parsed.routes ?? [];
  } catch {
    return [];
  }
}

/** Build OpenAPI 3.0 document from route manifest (filesystem scan or bundled JSON). */
export function buildOpenApiDocument(): Record<string, unknown> {
  const pathsList = listApiPaths();
  const routes: ApiRouteEntry[] = pathsList.map((path) => ({
    path,
    methods: [...METHODS],
    tag: tagFromPath(path),
  }));

  const paths: Record<string, Record<string, unknown>> = {};
  for (const route of routes) {
    paths[route.path] ??= {};
    for (const method of route.methods) {
      paths[route.path][method.toLowerCase()] = {
        tags: [route.tag],
        summary: `${method} ${route.path}`,
        operationId: `${method.toLowerCase()}_${route.path.replace(/[^a-zA-Z0-9]/g, "_")}`,
        responses: {
          "200": { description: "Success" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      };
    }
  }

  applyPublicApiV1Paths(paths);

  const tags = [...new Set(routes.map((r) => r.tag))].sort().map((name) => ({
    name,
    description: `KitchenOS ${name} API routes`,
  }));

  return {
    openapi: "3.0.3",
    info: {
      title: "KitchenOS API",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "1.0.0",
      description:
        "Auto-generated route manifest for partner integrations. Public API v1 routes (`/api/public/v1/*`) require `Authorization: Bearer kos_...` with Enterprise entitlement. Method list is indicative for non-v1 routes — inspect each handler for supported verbs.",
    },
    servers: [{ url: "https://os-kitchen.com", description: "Production" }],
    tags,
    paths,
    components: {
      securitySchemes: {
        bearerApiKey: {
          type: "http",
          scheme: "bearer",
          description: "Workspace API key — `Authorization: Bearer kos_...` (Enterprise entitlement required)",
        },
        sessionCookie: { type: "apiKey", in: "cookie", name: "sb-access-token" },
        cronSecret: { type: "http", scheme: "bearer", description: "CRON_SECRET for /api/cron/*" },
      },
    },
  };
}

export function countApiRoutes(): number {
  return listApiPaths().length;
}
