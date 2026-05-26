# Partner white-label

## Schema hooks

`PartnerAccount` includes:

- `whiteLabelEnabled`  
- `customDomain`  
- `logoUrl`  
- `supportEmail`  
- `websiteUrl`, `region`, `timezone`

## Product requirements before enabling

1. **Domain verification** (TXT/CNAME) to prevent domain hijack.  
2. **TLS certificate** automation (e.g. ACME) for custom hostnames.  
3. **Theme pack** per partner (CSS variables + asset bundle).  
4. **Email sending domain** alignment (SPF/DKIM/DMARC) for onboarding and billing notices.  
5. **Branded PDFs** generated from templates referencing verified assets only.

## Routing

Subdomain or custom domain routing belongs in edge middleware: resolve hostname → `PartnerAccount` → inject theme + scoped navigation. Not enabled in this iteration; fields exist for forward compatibility.

## Training

White-label training portals should reuse the same access gates as the main app with partner-scoped content libraries (future).
