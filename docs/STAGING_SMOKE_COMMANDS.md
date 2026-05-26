# Staging smoke — copy-paste commands

Full manual UI walkthrough: **[MANUAL_UI_SMOKE_CHECKLIST.md](./MANUAL_UI_SMOKE_CHECKLIST.md)**

Migration is **done** when `npx prisma migrate status` shows *Database schema is up to date!*

Do **not** paste doc placeholders like `<OWNER_UUID>` — zsh treats `<` as input redirection.

## 1. List eligible workspace owners

```bash
npm run smoke:team-invites -- --list
```

Copy your email from the output.

## One command (recommended)

Run each line separately, or use the bundled script:

```bash
npm run smoke:staging
```

With Public API key:

```bash
export SMOKE_PUBLIC_API_KEY="kos_paste_your_real_key_here"
export SMOKE_PUBLIC_API_BASE="http://localhost:3000"
npm run smoke:staging
```

Do not paste markdown blocks with parentheses in comments — zsh may error with `parse error near ')'`.

## 2. Create → list → cancel (default)

```bash
npm run smoke:team-invites -- --owner-email=workspace.moroz@gmail.com
```

Or with UUID:

```bash
npm run smoke:team-invites -- --owner-user-id=550e8400-e29b-41d4-a716-446655440000
```

Or env (no flags):

```bash
export SMOKE_OWNER_EMAIL="YOUR_LOGIN_EMAIL@example.com"
npm run smoke:team-invites
```

## 3. Full accept path

Invite email must match the accepting user's profile email.

```bash
npm run smoke:team-invites -- \
  --owner-email=owner@example.com \
  --email=staff@example.com \
  --accept-user-id=INVITEE_USER_PROFILE_UUID
```

## 4. Help

```bash
npm run smoke:team-invites -- --help
```

## Common errors

| Error | Fix |
|-------|-----|
| `zsh: no such file or directory: OWNER_UUID` | You used `<OWNER_UUID>` literally — use real UUID or `--owner-email` |
| `zsh: parse error near \n` | Broken line continuation — run as one line or end each line with `\` |
| `No storefront with workspace` | Pick owner from `--list` who has `workspace=` set |
