# Pilot PR — commands (no git in this workspace)

This copy of KitchenOS has **no `.git` directory**. Run these commands on the machine that holds the canonical repository remote.

## 1. Verify clean state

```bash
git status -sb
git diff --stat
```

## 2. Commit (Phases U–Z)

```bash
git add -A
git status

git commit -m "$(cat <<'EOF'
Pilot-18May-ULTIMATE: Final readiness verification (Phases U-Z)

Phases U-Z complete:
- Absolute reverification of pilot file inventory (37 core files, 0 missing)
- Full user path simulation (Signup→Order, Storefront, WooCommerce)
- Static analysis: typecheck PASS, lint PASS, test 604/604, build PASS, preflight PASS
- Micro-issues scan: TODO, any, hardcoded URLs, secrets — no critical findings
- Ops artifacts validated; launch plan and signoff updated

Status: READY_FOR_PILOT (code)
Ops dependencies: backfill, Upstash, Vercel Cron, E2E golden path
First paying operator: not before 22 May 2026 (after staging green 19-21 May)

See: docs/PILOT_FINAL_SIGNOFF_18MAY.md
See: docs/PILOT_LAUNCH_PLAN_18MAY.md
EOF
)"
```

## 3. Push and open PR

```bash
git push -u origin HEAD

gh pr create \
  --title "[PILOT] Ultimate Readiness — 18 May 2026" \
  --body-file docs/PILOT_PR_DESCRIPTION.md \
  --label "pilot" \
  --label "ready-for-review" \
  --label "do-not-merge-until-staging-verified"
```

## 4. Post-merge ops

Follow `docs/PILOT_STAGING_RUNBOOK.md` and `docs/PILOT_LAUNCH_PLAN_18MAY.md`.
