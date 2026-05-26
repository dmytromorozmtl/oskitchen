# Local Node.js setup (KitchenOS)

The IDE agent runtime may **not** include `npm` or Homebrew. On your Mac, use **Terminal.app**, **iTerm**, or **Cursor’s integrated terminal** (which loads your login shell and `PATH`).

## 1. Quick check

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
pwd
which node
node -v
which npm
npm -v
which brew
brew -v
```

### If `brew` exists but `command not found`

**Apple Silicon:**

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Intel:**

```bash
eval "$(/usr/local/bin/brew shellenv)"
```

Add the matching line to `~/.zprofile` or `~/.zshrc` so every new terminal has `brew` in `PATH`.

### If `npm` might be installed but not on PATH

Check:

```bash
ls /opt/homebrew/bin/npm /usr/local/bin/npm 2>/dev/null
ls ~/.nvm ~/.fnm ~/.volta 2>/dev/null
```

For **nvm**:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use --lts
```

For **fnm**:

```bash
eval "$(fnm env)"
```

## 2. Install Node (recommended: Homebrew)

If Homebrew is installed:

```bash
brew install node
node -v
npm -v
```

Install Homebrew from [https://brew.sh](https://brew.sh) if needed.

## 3. Install Node without Homebrew

Download the **LTS** installer from [https://nodejs.org](https://nodejs.org), run it, then open a **new** terminal and verify:

```bash
node -v
npm -v
```

## 4. After Node works

From the project root:

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
npm run dev
```

Or run the bundled script:

```bash
chmod +x scripts/local-check.sh   # once
./scripts/local-check.sh
# or
npm run local-check
```

## 5. Environment file

Copy `.env.example` → `.env.local` and replace placeholders with real Supabase and database URLs. See comments inside `.env.example`.

Without real Supabase values, middleware skips session handling in **development** so pages can load; **production** returns `503` on `/dashboard` if Supabase is still misconfigured.
