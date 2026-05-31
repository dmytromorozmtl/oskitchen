# Channel credential security

- **Algorithm:** AES-256-GCM in `lib/crypto.ts` (`ENCRYPTION_KEY` required for real saves).
- **UI:** Never return decrypted material to the browser; forms use blank = keep existing.
- **Helpers:** `lib/channels/credentials.ts` (`maskSecret`, `logChannelCredentialAudit`).
- **Audit:** `ChannelCredentialAudit` records `SAVE`, `DISCONNECT`, etc., with JSON metadata **excluding** secrets/ciphertext.
- **Production:** Save actions fail closed when encryption is not configured.

Rotate credentials: operators should save new keys in the partner console, then paste into OS Kitchen to overwrite ciphertext; document partner-side revocation separately.
