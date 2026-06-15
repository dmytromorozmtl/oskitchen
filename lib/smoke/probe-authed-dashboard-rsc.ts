import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  AUTHED_DASHBOARD_RSC_SMOKE_ROUTES,
  type AuthedDashboardRscSmokeRoute,
} from "@/lib/smoke/authed-dashboard-rsc-routes";

export const RSC_FAILURE_PATTERNS = [
  /Something went wrong/i,
  /An error occurred in the Server Components render/i,
  /Application error: a server-side exception has occurred/i,
] as const;

export type DashboardProbeMode = "document" | "rsc";

export type DashboardProbeResult = {
  path: string;
  mode: DashboardProbeMode;
  url: string;
  status: number;
  ok: boolean;
  error?: string;
  digest?: string;
  bodyBytes: number;
};

export type AuthedDashboardRscProbeSummary = {
  baseUrl: string;
  routeCount: number;
  probeCount: number;
  failed: number;
  results: DashboardProbeResult[];
};

export function buildSupabaseSessionCookie(
  supabaseUrl: string,
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
    user: unknown;
  },
): string {
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  return `sb-${projectRef}-auth-token=${encodeURIComponent(
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type ?? "bearer",
      user: session.user,
    }),
  )}`;
}

export function detectRscFailure(body: string): { failed: boolean; digest?: string } {
  const hits = RSC_FAILURE_PATTERNS.filter((pattern) => pattern.test(body));
  if (hits.length === 0) {
    return { failed: false };
  }
  return {
    failed: true,
    digest: body.match(/"digest":"[^"]+"/)?.[0],
  };
}

export async function probeAuthedDashboardPath(input: {
  baseUrl: string;
  cookie: string;
  path: string;
  mode: DashboardProbeMode;
}): Promise<DashboardProbeResult> {
  const headers: Record<string, string> = {
    Cookie: input.cookie,
    Accept: input.mode === "rsc" ? "text/x-component" : "text/html",
  };
  if (input.mode === "rsc") {
    headers.RSC = "1";
    headers["Next-Router-Prefetch"] = "1";
  }

  const res = await fetch(`${input.baseUrl.replace(/\/$/, "")}${input.path}`, {
    headers,
    redirect: "follow",
  });
  const body = await res.text();
  const rscFailure = detectRscFailure(body);

  let ok = res.status >= 200 && res.status < 400 && !rscFailure.failed;
  let error: string | undefined;
  if (res.status >= 500) {
    ok = false;
    error = `HTTP ${res.status}`;
  } else if (rscFailure.failed) {
    ok = false;
    error = "RSC failure text in response";
  } else if (res.status >= 400) {
    ok = false;
    error = `HTTP ${res.status}`;
  }

  return {
    path: input.path,
    mode: input.mode,
    url: res.url,
    status: res.status,
    ok,
    error,
    digest: rscFailure.digest,
    bodyBytes: body.length,
  };
}

export async function signInForDashboardProbe(input: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  email: string;
  password: string;
  supabase?: SupabaseClient;
}): Promise<{ cookie: string; email: string }> {
  const supabase =
    input.supabase ??
    createClient(input.supabaseUrl.trim(), input.supabaseAnonKey.trim());
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password.trim(),
  });
  if (error || !data.session) {
    throw new Error(error?.message ?? "Supabase login failed — no session");
  }
  return {
    email: input.email.trim(),
    cookie: buildSupabaseSessionCookie(input.supabaseUrl, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: data.user,
    }),
  };
}

export async function runAuthedDashboardRscProbe(input: {
  baseUrl: string;
  cookie: string;
  paths?: readonly string[];
}): Promise<AuthedDashboardRscProbeSummary> {
  const paths = (input.paths?.length ? input.paths : AUTHED_DASHBOARD_RSC_SMOKE_ROUTES) as readonly string[];
  const results: DashboardProbeResult[] = [];

  for (const path of paths) {
    for (const mode of ["document", "rsc"] as const) {
      results.push(
        await probeAuthedDashboardPath({
          baseUrl: input.baseUrl,
          cookie: input.cookie,
          path,
          mode,
        }),
      );
    }
  }

  const failed = results.filter((result) => !result.ok).length;
  return {
    baseUrl: input.baseUrl.replace(/\/$/, ""),
    routeCount: paths.length,
    probeCount: results.length,
    failed,
    results,
  };
}

export function resolveAuthedDashboardProbePaths(
  argvPaths: readonly string[],
): readonly AuthedDashboardRscSmokeRoute[] | readonly string[] {
  return argvPaths.length > 0 ? argvPaths : AUTHED_DASHBOARD_RSC_SMOKE_ROUTES;
}
