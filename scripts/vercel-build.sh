#!/usr/bin/env bash
# Vercel build — reuse local .next when present; always ensure .next/package.json for CLI.
set -euo pipefail

# Remote Vercel builders: force heap high (dashboard NODE_OPTIONS env must not cap at 4 GB).
if [[ -n "${VERCEL:-}" ]]; then
  export NODE_OPTIONS="--max-old-space-size=14336"
  export NEXT_STATIC_GENERATION_MAX_CONCURRENCY="1" # lib/performance/static-generation-concurrency-policy.ts
  # Webpack cache warnings flood the build log (>4 MB) and fail the deployment on Vercel.
  export NEXT_WEBPACK_CACHE=0
  echo "▶ Vercel remote build (${NODE_OPTIONS}, SSG concurrency=1, webpack cache off)"
else
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"
fi
export NEXT_TELEMETRY_DISABLED=1

for f in .env.production.local .vercel/.env.production.local; do
  if [[ -f "$f" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$f"
    set +a
    break
  fi
done

# Vercel env pull / dashboard can leave KEY="" — treat as unset.
for _kos_var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY; do
  if [[ -z "${!_kos_var//[[:space:]]/}" ]]; then
    unset "$_kos_var"
  fi
done
if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" || -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]] && [[ -f .env.local ]]; then
  set -a
  # shellcheck source=/dev/null
  source .env.local
  set +a
fi
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://eycxwxxyrzdhhqcnxifz.supabase.co}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-sb_publishable_dD4M3pNzWjB-8Ae4-ZIKKw_U8MXvFm4}"

if [[ -f .next/BUILD_ID ]] && [[ -f .next/routes-manifest.json ]]; then
  echo "✓ Reusing existing Next.js build (.next/BUILD_ID=$(cat .next/BUILD_ID))"
else
  node ./node_modules/next/dist/bin/next build
fi

if [[ ! -f .next/package.json ]]; then
  cp package.json .next/package.json
fi
