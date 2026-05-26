#!/usr/bin/env bash
# Source env files; skip blank values. Later files override earlier.
# Order: .env → .env.local (DB) → .env.staging.local (pilot secrets).
# shellcheck disable=SC1090

_export_kv() {
  local key="$1"
  local val="$2"
  val="${val%\"}"
  val="${val#\"}"
  val="${val%\'}"
  val="${val#\'}"
  [[ -z "${val// }" ]] && return 0
  export "${key}=${val}"
}

_source_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    [[ -z "$line" ]] && continue
    if [[ "$line" != *=* ]]; then
      continue
    fi
    local key="${line%%=*}"
    local val="${line#*=}"
    key="${key%"${key##*[![:space:]]}"}"
    key="${key#"${key%%[![:space:]]*}"}"
    _export_kv "$key" "$val"
  done <"$file"
}

load_staging_env() {
  set -a
  for f in ".env" ".env.local" ".env.staging.local"; do
    _source_env_file "$f"
  done
  set +a
}
