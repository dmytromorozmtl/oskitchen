#!/usr/bin/env bash
# Vercel "Ignored Build Step": exit 0 = skip Git-triggered remote build.
# Release production via: npm run deploy:prod (local prebuilt).
echo "Skipping Vercel remote build — use: npm run deploy:prod"
exit 0
