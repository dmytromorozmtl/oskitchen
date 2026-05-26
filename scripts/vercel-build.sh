#!/usr/bin/env bash
# Vercel build — reuse local .next when present; always ensure .next/package.json for CLI.
set -euo pipefail

# Remote Vercel builders: force heap high (dashboard NODE_OPTIONS env must not cap at 4 GB).
if [[ -n "${VERCEL:-}" ]]; then
  export NODE_OPTIONS="--max-old-space-size=14336"
  export NEXT_STATIC_GENERATION_MAX_CONCURRENCY="1"
  echo "▶ Vercel remote build (${NODE_OPTIONS}, SSG concurrency=1)"
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

if [[ -f .next/BUILD_ID ]] && [[ -f .next/routes-manifest.json ]]; then
  echo "✓ Reusing existing Next.js build (.next/BUILD_ID=$(cat .next/BUILD_ID))"
else
  node ./node_modules/next/dist/bin/next build
fi

if [[ ! -f .next/package.json ]]; then
  cp package.json .next/package.json
fi
