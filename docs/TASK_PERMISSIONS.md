# Task permissions

Until OS Kitchen exposes a true `WorkspaceMember.role`, task permissions are
derived from a small actor scope:

```ts
type TaskActorScope = {
  isOwner: boolean;
  role?: string | null;   // best-effort from StaffMember
  email?: string | null;  // for the superadmin override
};
```

## Effective rules

| Permission | Owner | Manager / Dispatcher / Admin | Other roles | No role | Superadmin |
|------------|:-----:|:----------------------------:|:-----------:|:-------:|:----------:|
| `task.read` | ✓ | ✓ | ✓ (assigned) | – | ✓ |
| `task.create` | ✓ | ✓ | ✓ | – | ✓ |
| `task.update` | ✓ | ✓ | ✓ (assigned) | – | ✓ |
| `task.complete` | ✓ | ✓ | ✓ (assigned) | – | ✓ |
| `task.assign` | ✓ | ✓ | – | – | ✓ |
| `task.cancel` | ✓ | ✓ | – | – | ✓ |
| `task.bulk.update` | ✓ | ✓ | – | – | ✓ |
| `task.template.manage` | ✓ | ✓ | – | – | ✓ |

## Superadmin

`isSuperAdminEmail(email)` short-circuits everything: the platform owner
(`workspace.moroz@gmail.com`) has all task permissions in every workspace.
Source of truth: `lib/platform-owner.ts`.

## Data scoping

Every server action and service call filters by `userId = sessionUser.id`. The
owner check today is implicit — the workspace owner is "the user that owns the
data row". Once `WorkspaceMember` lands, swap the actor scope assembly in
`actions/kitchen-task.ts` and `services/tasks/task-service.ts` without
touching the UI.

## Role-based filtering

- `/dashboard/tasks/my` returns tasks where:
  - `assignedToId` matches a `StaffMember` owned by the current user **and**
    that staff row's email matches the signed-in email, **OR**
  - `assignedRole` matches one of the user's staff roles, **OR**
  - `createdById` equals the user id.
