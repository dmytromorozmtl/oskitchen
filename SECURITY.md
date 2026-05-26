# Security policy

## Supported versions

KitchenOS is under active development. Security fixes land on the default production branch as soon as practical.

## Reporting a vulnerability

Please email the maintainers using the contact method published for your deployment (set `NEXT_PUBLIC_SUPPORT_EMAIL` for in-app feedback routing).

**Do not** open public GitHub issues for undisclosed vulnerabilities.

Include:

- Description and impact
- Steps to reproduce
- Affected routes or integrations (if known)

## Out of scope

- Social engineering against employees or users
- Missing HTTP headers without demonstrated exploit
- Rate limiting absent without abuse demonstration

## Secret handling

Never commit `.env`, `.env.local`, or API keys. Rotate credentials if exposed — see `docs/SECRET_ROTATION_PLAN.md`.
