#!/usr/bin/env bash
# Run workspace backfill phases 1–7 and 11 in order (staging / approved production only).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

if [[ "${PILOT_LOCAL_ENV:-}" == "1" ]]; then
  unset NODE_ENV
  export PILOT_LOCAL_ENV=1
fi

EXTRA=("$@")
PHASES=(1 2 3 4 5 6 7 11)
PHASE_SCRIPTS=(
  scripts/backfill-workspace-id.ts
  scripts/backfill-workspace-phase2.ts
  scripts/backfill-workspace-phase3.ts
  scripts/backfill-workspace-phase4.ts
  scripts/backfill-workspace-phase5.ts
  scripts/backfill-workspace-phase6.ts
  scripts/backfill-workspace-phase7.ts
  scripts/backfill-workspace-phase11.ts
)

echo "Workspace backfill — phases: ${PHASES[*]}"
if [[ " ${EXTRA[*]:-} " == *" --dry-run "* ]]; then
  echo "(dry-run mode — no writes)"
fi

for i in "${!PHASES[@]}"; do
  p="${PHASES[$i]}"
  script="${PHASE_SCRIPTS[$i]}"
  echo ""
  echo "== Phase ${p} =="
  tsx "$script" "${EXTRA[@]:-}"
done

echo ""
echo "== Post-backfill status =="
tsx scripts/check-backfill-status.ts
