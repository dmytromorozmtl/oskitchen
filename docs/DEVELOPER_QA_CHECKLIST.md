# Developer Center QA Checklist

- [ ] Owner can open `/dashboard/developer` and all sub-routes.
- [ ] Platform superadmin (`workspace.moroz@gmail.com` or `SUPER_ADMIN` row) can access Developer nav + pages without workspace OWNER role.
- [ ] Non-owner/non-super user is redirected away from Developer routes.
- [ ] API key create shows secret once; revoke works; no secret in network payloads after creation.
- [ ] Incident create writes audit row; appears in `/incidents` and `/logs`.
- [ ] Environment validation tool writes audit row.
- [ ] Webhook page shows recent rows; no `payload_json` rendered.
- [ ] `npm run typecheck` and `npm run build` succeed.
