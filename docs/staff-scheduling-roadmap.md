# Staff, Scheduling, Shift, And Payroll Roadmap

Status: workforce roadmap tied to the RBAC canon
Primary evidence: `actions/staff.ts`, `actions/labor/schedule.ts`, `actions/labor/time-clock.ts`, `actions/training.ts`, `services/staff/`, `services/labor/`, `docs/system-reality-model.md`, `docs/rbac-permission-architecture.md`

## Goal
Turn staff, labor, and training from adjacent modules into one workforce operating layer that directly governs POS, KDS, order, and reporting access.

## Capability Roadmap
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| staff profiles, roles, permissions | staff and custom role flows exist | not yet tied to one canonical permission system | role-to-permission linkage to canonical registry | staff role resolution services | clearer role and permission views | `staff.read`, `staff.manage` | role assignment/change logs | staff role tests | staff permissions map to POS/KDS/actions |
| PIN login, shift-bound usage | not production-grade outside partial POS flows | operator/device safety missing | PIN/device/session models | auth + staff session services | PIN setup/login UX | `staff.manage`, `pos.access` | PIN/device assignment logs | PIN/session tests | staff can authenticate quickly and safely |
| time clock | time clock exists | needs stronger policy and reporting maturity | break/overtime policy metadata as needed | time-clock policy services | cleaner clock in/out and exception states | `timeclock.manage` | clock in/out edits | time-clock tests | staff can clock in/out reliably |
| shift schedule, availability, shift swaps | schedule and availability exist | swaps and operator coordination are immature | swap request entities | swap/approval services | schedule board and swap flows | `schedule.manage` | shift create/update/swap logs | scheduling tests | owner can schedule and adjust staffing |
| break tracking, overtime warnings | not mature | labor compliance and planning depth missing | break/overtime policy fields | labor warning services | overtime and break indicators | `schedule.manage`, `timeclock.manage` | policy and override logs | overtime/break tests | managers can prevent labor surprises |
| labor cost, payroll export | payroll-adjacent and finance surfaces exist | payroll-grade readiness is still preview | export and labor snapshot refinement | payroll export/report services | labor cost dashboards and export UX | `payroll.export`, `financials.view` | payroll export logs | payroll export tests | labor reports work and export reliably |
| server/cashier performance | POS and order analytics foundations exist | workforce performance packaging is partial | staff performance snapshots | staff KPI services | performance cards and comparisons | `analytics.view`, `staff.read` | KPI recalculation logs | performance tests | owner can review operator performance |
| certifications, training mode, food safety assignments | training and certification flows are real | go-live gating and role integration need maturity | training-to-role policy linkage | certification and readiness services | assignment and readiness dashboards | `staff.manage`, `training.cert.issue` and related permissions | cert assignment/issue/revoke logs | training/certification tests | staff readiness is visible and auditable |

## Implementation Order
1. tie staff roles and custom roles into canonical permissions
2. mature schedule/time-clock workflows and reporting
3. add PIN/device/session governance for FOH/KDS usage
4. package certifications and readiness into launch/workforce workflows
5. deepen labor cost, overtime, and payroll exports

## Acceptance Bar
- staff permissions map to POS/KDS/actions
- staff can clock in/out
- owner can schedule
- labor reports work
- payroll export exists

## Product Guardrails
- Workforce claims should stay tied to operational control first, not full HRIS/payroll replacement.
- No role or PIN workflow should bypass the canonical permission model.
