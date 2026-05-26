# Week 4 — Create GitHub issue (file upload sprint)

**Template:** `.github/ISSUE_TEMPLATE/storefront-forms-file-upload.yml`

## Option A — GitHub CLI

```bash
gh issue create \
  --title "[Storefront] Forms file-upload E2E" \
  --label "storefront,enhancement" \
  --body-file docs/artifacts/WEEK4_FILE_UPLOAD_ISSUE.md
```

## Option B — UI

1. GitHub → repository → **Issues** → **New issue**  
2. Choose **Storefront — forms file upload (Week 4)**  
3. Fill acceptance criteria → Submit  

## Sprint scope (reference)

- Field type `file` in builder forms  
- Public upload with size/MIME limits  
- Storage: `storefront-media` or `storefront-uploads`  
- Turnstile on dynamic form POST  
- E2E with fixture file  

**Not blocking** storefront launch.
