# Support session QA matrix

| # | Case | Expected | Status |
|---|------|----------|--------|
| 1 | Client (non-platform) hits `/platform` | Blocked by existing platform gate | Manual |
| 2 | Platform support admin starts READ_ONLY session with reason | Session row ACTIVE, audit STARTED | Manual |
| 3 | Missing reason | `startPlatformSupportSession` rejects | Manual |
| 4 | Session has expiry | `expiresAt` = now + TTL hours | Manual |
| 5 | Banner on platform | `SupportSessionPlatformBanner` visible with cookie | Manual |
| 6 | Notice on dashboard | `SupportSessionCustomerNotice` for workspace members | Manual |
| 7 | End session | Status ENDED, audit ENDED, cookie cleared | Manual |
| 8 | Read-only blocks mutations | **Deferred** — requires global guard; not in this pass | N/A |
| 9 | Assisted edit stronger permission | Service rejects ASSISTED_EDIT | Auto |
| 10 | Secrets in session UI | No tokens/URLs surfaced | Manual |
| 11 | Non-founder vs protected owner workspace | Start rejected unless founder email | Manual |
| 12 | Expired session | `expireStaleSupportSessions` marks EXPIRED + audit | Auto |
