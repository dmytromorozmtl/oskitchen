# Git Remote Backup Setup

**Audience:** Founder, VP Engineering, DevOps  
**Status:** **Human gate** — this clone has **no `git remote` configured** (786 commits, single-machine risk)  
**Related:** [`GITHUB_SETUP.md`](./GITHUB_SETUP.md), [`SECRET_ROTATION_PLAN.md`](./SECRET_ROTATION_PLAN.md)

---

## Why this matters

| Risk without remote | Impact |
|---------------------|--------|
| Single-machine repo | Total loss if laptop fails |
| No CI/CD integration | GitHub Actions + Vercel previews blocked |
| No collaborator backup | Bus factor = 1 |
| No off-site history | 786 commits unprotected |

**Execution tracker:** `artifacts/30-action-tracker.json` → `3-git-remote` (docs done; remote pending human)

---

## Step 1 — Create GitHub repository

1. GitHub → **New repository** → name e.g. `KitchenOS` or `kitchenos`
2. Visibility: **Private**
3. Do **not** initialize with README (repo already has history)
4. Copy the remote URL:
   - SSH: `git@github.com:YOUR_ORG/KitchenOS.git`
   - HTTPS: `https://github.com/YOUR_ORG/KitchenOS.git`

---

## Step 2 — Add remote (local)

```bash
cd /path/to/KitchenOS

# Verify no remote yet
git remote -v

# Add origin (replace YOUR_ORG and repo name)
git remote add origin git@github.com:YOUR_ORG/KitchenOS.git

# Or HTTPS:
# git remote add origin https://github.com/YOUR_ORG/KitchenOS.git

git remote -v
```

Expected output:

```text
origin  git@github.com:YOUR_ORG/KitchenOS.git (fetch)
origin  git@github.com:YOUR_ORG/KitchenOS.git (push)
```

---

## Step 3 — First push

```bash
git branch --show-current   # should be main
git push -u origin main
```

If GitHub rejects (unrelated histories), you created an initialized repo — delete empty repo and recreate without README, or use:

```bash
git push -u origin main --force-with-lease
```

**Only use force-with-lease if you are certain the remote is empty.**

---

## Step 4 — Verify backup

```bash
git ls-remote origin HEAD
git log origin/main --oneline -3
```

Pass criteria:

- [ ] `git remote -v` shows `origin`
- [ ] `git push` succeeds without error
- [ ] GitHub web UI shows latest commit (e.g. `3f78c865` or newer)
- [ ] Branch protection enabled on `main` (Settings → Branches)

---

## Step 5 — Connect Vercel (recommended)

1. Vercel Dashboard → Import Project → GitHub → select repo
2. Production branch: `main`
3. Environment variables: [`vercel-env-vars-production.md`](./vercel-env-vars-production.md)
4. Enable preview deployments on PRs

---

## Step 6 — GitHub Actions secrets (for CI smokes)

After remote exists, add repository secrets (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|--------|---------|
| `E2E_STAGING_BASE_URL` | Staging smoke |
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Staging login |
| `DATABASE_URL` / `ENCRYPTION_KEY` | Channel smokes |
| `SSO_STAGING_*` (5 vars) | SSO IdP smoke |

Full list: [`ops-vault-matrix.md`](./ops-vault-matrix.md)

---

## Security checklist before push

- [ ] `.env`, `.env.local` in `.gitignore` and **not tracked**
- [ ] No `sk_live_*`, `whsec_*`, service role keys in committed files
- [ ] Run `git log -p --all -S 'sk_live' -- '*.ts' '*.json'` — should be empty or test-only redaction
- [ ] If secrets were ever exposed locally → [`SECRET_ROTATION_PLAN.md`](./SECRET_ROTATION_PLAN.md)

---

## Ongoing backup hygiene

| Cadence | Action |
|---------|--------|
| After each merge | `git push origin main` |
| Weekly | Confirm GitHub has latest commit hash |
| Before travel | `git push` + verify on github.com |
| New machine | `git clone git@github.com:YOUR_ORG/KitchenOS.git` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Permission denied (publickey)` | Add SSH key to GitHub → Settings → SSH keys |
| `remote origin already exists` | `git remote set-url origin NEW_URL` |
| Large repo push timeout | `git config http.postBuffer 524288000` or use SSH |
| Accidentally pushed secrets | Rotate keys immediately; use `git filter-repo` or GitHub secret scanning |

---

## Human gate sign-off

| Role | Action | Date |
|------|--------|------|
| Founder / VP Eng | Created private GitHub repo | ______ |
| DevOps | Added `origin` + first push | ______ |
| DevOps | Vercel Git integration connected | ______ |
| Security | Pre-push secret scan passed | ______ |

**Do not mark `3-git-remote` complete in tracker until `git remote -v` is non-empty and push succeeds.**
