# Status Language System

## Libraries

| File | Responsibility |
|------|----------------|
| `lib/status/status-copy.ts` | `humanOrderStatus`, `humanOperationalPhrase`, `sentenceCaseToken` |
| `lib/status/status-colors.ts` | `toneForOrderStatus`, `STATUS_TONE_CLASSES` |
| `lib/status/status-severity.ts` | `severityFromBlockerCount` |

## Components

| File | Responsibility |
|------|----------------|
| `components/status/status-badge.tsx` | Outlined pill with tone classes |
| `components/status/operational-state-badge.tsx` | Primary operational label + optional hint |

## Usage guidelines

1. Show **one** primary business status to customers; push engineering enums to secondary tooltips.  
2. Pair with **blocker summary** strings from Today / order services when available.  
3. Prefer `humanOperationalPhrase` for long enum constants.

## Rollout

Adopt incrementally on Orders table filters, Today blockers, and production headers — avoid big-bang string changes without QA.
