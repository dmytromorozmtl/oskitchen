#!/usr/bin/env bash
# Ensure node/npm are on PATH (CI, Cursor agent, minimal shells).
ensure_node_path() {
  # DevDependencies (vitest, tsx, prisma CLI) required for pilot scripts
  export NPM_CONFIG_PRODUCTION="${NPM_CONFIG_PRODUCTION:-false}"
  if command -v npm >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    return 0
  fi
  for prefix in \
    "/opt/homebrew/bin" \
    "/usr/local/bin" \
    "$HOME/.nvm/versions/node/"*/bin; do
    if [[ -x "${prefix}/npm" ]] && [[ -x "${prefix}/node" ]]; then
      export PATH="${prefix}:${PATH}"
      return 0
    fi
  done
  echo "node/npm not found. Install Node 22+ or enable nvm." >&2
  return 1
}

ensure_node_path || exit 1
NPM="$(command -v npm)"
NODE="$(command -v node)"

tsx() {
  # Non-interactive (CI / agent shells); prefer project tsx when .bin exists
  local bin
  bin="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/node_modules/.bin/tsx"
  if [[ -x "$bin" ]]; then
    "$bin" "$@"
    return
  fi
  NPM_CONFIG_YES=true "$NPM" exec --yes --package=tsx -- tsx "$@"
}
