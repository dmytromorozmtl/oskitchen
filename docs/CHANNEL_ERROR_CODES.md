# Channel error codes

Canonical definitions live in `lib/channels/channel-errors.ts` (`CHANNEL_*`). Each entry includes:
- `code`, `severity`, `userMessage`, `developerMessage`, `suggestedAction`.

## Usage
Map integration/webhook exceptions to these codes before persisting `processingError` or staging metadata.
