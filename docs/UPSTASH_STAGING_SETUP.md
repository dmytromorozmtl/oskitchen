# Upstash — staging setup (5 minutes)

Required for `RATE_LIMIT_ADAPTER=upstash` on Vercel staging.

## 1. Create database

1. Open [Upstash Console](https://console.upstash.com)
2. **Create Database** → name e.g. `kitchenos-staging`
3. Region: closest to Supabase (`us-west-2` if DB is Oregon)

## 2. Copy REST credentials

1. Open the database → **REST API** tab  
2. Copy **UPSTASH_REDIS_REST_URL** (ends with `.upstash.io`)  
3. Copy **UPSTASH_REDIS_REST_TOKEN**

## 3. Save locally (OS Kitchen)

```bash
# Paste REAL values from Upstash console (not doc placeholders):
npm run staging:upstash:set -- \
  --url="https://us1-adequate-lobster-12345.upstash.io" \
  --token="AX1aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789"
```

Or export vars and run:

```bash
export UPSTASH_REDIS_REST_URL="https://…"
export UPSTASH_REDIS_REST_TOKEN="AX…"
npm run staging:upstash:set
```

## 4. Push to Vercel

```bash
npm run vercel:staging-push -- --dry-run
npm run vercel:staging-push -- --apply
```

Redeploy staging after env change.

## 5. Verify

```bash
npm run verify:staging-env
npm run pilot:next-step
```

Expected: `Upstash REST ping` = OK.
