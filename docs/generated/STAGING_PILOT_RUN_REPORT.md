# Staging pilot run report

Generated: 2026-05-18T09:36:32Z

## Code readiness

Skipped (SKIP_PILOT_CODE_READINESS=1). Run `npm run verify:pilot-readiness` separately.

## Staging env gate (local pilot)
```
    === Staging environment verification ===
    
    Mode: --local-pilot (Upstash optional; use full gate on Vercel staging)
    
    OK    DATABASE_URL
    OK    DIRECT_URL
    OK    NEXT_PUBLIC_SUPABASE_URL
    OK    NEXT_PUBLIC_SUPABASE_ANON_KEY
    OK    SUPABASE_SERVICE_ROLE_KEY
    OK    RATE_LIMIT_ADAPTER
    OK    CRON_SECRET
    OK    ENCRYPTION_KEY
    OK    UPSTASH_REDIS_REST_URL
    WARN  Optional for local pilot: UPSTASH_REDIS_REST_TOKEN
    OK    NEXT_PUBLIC_APP_URL
    WARN  Recommended: RESEND_API_KEY
    OK    RESEND_FROM_EMAIL
    OK    DATABASE_URL + DIRECT_URL shape
    WARN  RATE_LIMIT_ADAPTER=memory — OK for local DB pilot; set upstash on Vercel staging
    WARN  Upstash credentials incomplete — optional for --local-pilot
    OK    PLATFORM_IMPERSONATION_TOTP_SECRET (valid base32)
    OK    Experimental crons disabled
    
    Environment gate passed.
```

## Workspace migration
```
    OS Kitchen staging workspace migration
    DATABASE_URL host: aws-1-us-west-2.pooler.supabase.com
    
    == Preflight ==
    === Workspace migration preflight ===
    
    Prisma migrate: UNAVAILABLE
    Workspaces: 3 · Members: 3
    Orphan orders (owner has workspace, order.workspace_id NULL): 0
    
    OK       orders: 0 NULL
    OK       menus: 0 NULL
    OK       products: 0 NULL
    OK       integration_connections: 0 NULL
    OK       webhook_events: 0 NULL
    
    ✓ Backfill complete for tracked tables.
    
    Suggested commands:
      npm run workspace:provision:orphans  # if owners lack Workspace rows
      npm run staging:pilot:complete  # or: workspace:staging:migrate
      npx tsx scripts/check-backfill-status.ts
    
    == Provision orphan workspaces ==
    Provisioned 0 workspace(s).
    
    == Migrate deploy ==
    Unknown error during config file loading: Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/dmytro/Desktop/2026/OS Kitchen/node_modules/confbox/dist/ini.mjs' imported from /Users/dmytro/Desktop/2026/OS Kitchen/node_modules/pkg-types/dist/index.mjs
```

```

