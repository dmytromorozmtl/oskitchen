# SOC 2 Type I — Roadmap (Q4 2026 target)

**Current security posture:** ~92/100 engineering audit — not SOC2 certified  
**Enterprise blocker:** Yes for R365/Toast-scale deals — not for meal prep pilots

---

## Phase 1 — Gap analysis (Week 1–2)

| Trust criteria area | OS Kitchen today | Gap |
|---------------------|-----------------|-----|
| Access control | RBAC, tenant actor | Formal access review process |
| Change management | CI, PR reviews (solo) | Documented change policy |
| Monitoring | Sentry optional | 24/7 alerting runbook |
| Vendor management | Supabase, Vercel, Stripe | Subprocessor list + reviews |
| Incident response | Ad hoc | Written IR plan + tabletop |
| Pentest | None | Annual third-party pentest |

## Phase 2 — Controls (Month 2–3)

- [ ] Written security policies (acceptable use, IR, backup)
- [ ] Enable Sentry + uptime alerts on `/api/health`
- [ ] Quarterly access review checklist
- [ ] Cron secret rotation procedure
- [ ] Complete workspaceId migration (tenant isolation evidence)

## Phase 3 — Audit (Q4)

- [ ] Select auditor (Vanta, Drata, or boutique)
- [ ] Type I observation period (3–6 months evidence)
- [ ] Publish trust page badge

**Budget estimate:** $15–40k first year (tooling + audit)

---

*Until SOC2: sell Pro/Team to operators who do not require certification; disclose honestly on enterprise calls.*
