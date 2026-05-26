# Copilot permissions

Implementation: `lib/ai/copilot-permissions.ts`.

## Capabilities

```ts
type CopilotCapability =
  | "copilot.view"
  | "copilot.chat"
  | "copilot.read.operations"
  | "copilot.read.financial"
  | "copilot.read.customer_pii"
  | "copilot.read.audit"
  | "copilot.actions.draft"
  | "copilot.actions.approve"
  | "copilot.settings.manage"
  | "copilot.narrative.toggle";
```

## Matrix

| Capability | Owner | Manager | Admin | Accountant | Sales | Kitchen lead | Kitchen / Packer / Driver | Viewer | Superadmin |
|-----------|:-----:|:-------:|:-----:|:----------:|:-----:|:------------:|:-------------------------:|:------:|:----------:|
| `copilot.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `copilot.chat` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `copilot.read.operations` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `copilot.read.financial` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `copilot.read.customer_pii` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `copilot.read.audit` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `copilot.actions.draft` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `copilot.actions.approve` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `copilot.settings.manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `copilot.narrative.toggle` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Superadmin

`isSuperAdminEmail(scope.email)` always returns full access (matches
`PLATFORM_OWNER_EMAIL`, by default `workspace.moroz@gmail.com`).

## Enforcement points

- Every server action (`actions/copilot.ts`) calls `canUseCopilot`
  before mutating state.
- Every UI route (`app/dashboard/copilot/**/page.tsx`) calls
  `canUseCopilot` at the top of the page and renders a permission-
  denied card otherwise.
- Source-level gating is layered on top via
  `isAllowedSourceForRole` (`lib/ai/copilot-sources.ts`).
