#!/usr/bin/env bash
# Validate STOREFRONT_SMOKE_BASE_URL (angle brackets, placeholders). Sourced by release scripts.
validate_smoke_base_url() {
  local url="${1:-}"
  if [[ -z "${url}" ]]; then
    echo "✗ STOREFRONT_SMOKE_BASE_URL is not set"
    echo '  → export STOREFRONT_SMOKE_BASE_URL="https://your-project.vercel.app"'
    return 1
  fi
  if [[ "${url}" == *"<"* || "${url}" == *">"* ]]; then
    echo "✗ URL contains < or > — zsh treats <prod> as file redirect"
    echo '  → Use quotes and a real host, e.g.:'
    echo '     export STOREFRONT_SMOKE_BASE_URL="https://kitchenos-abc123.vercel.app"'
    return 1
  fi
  if [[ "${url}" =~ yourdomain|example\.com ]]; then
    echo "✗ Placeholder hostname in URL: ${url}"
    echo "  → Vercel → Deployments → copy Production or Preview domain"
    return 1
  fi
  if [[ ! "${url}" =~ ^https?:// ]]; then
    echo "✗ URL must start with https:// (or http:// for local only)"
    return 1
  fi
  return 0
}
