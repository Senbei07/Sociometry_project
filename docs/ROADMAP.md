# Implementation Roadmap & Codebase Gap Analysis
Version: 0.1 (2026-11-05) · Static repository review only

Repository reviewed: Senbei07/Sociometry_project, main at 144b74d0a4bfdedd495a412f769c1201cf5d9e83.
Files inspected: root README, client/server package manifests, server/server.js, server/config.js, client/src/App.jsx, client/src/pages/{pin,select,login,register,room_create,sociogram,calcuData}.jsx.
No environment, database schema, runtime behavior, test execution, or production configuration was verified.

## 1. Reusable components (candidates, not yet approved as production-safe)
| Area | Existing evidence | Recommendation |
| --- | --- | --- |
| React/Vite UI | client/src/App.jsx and pages | Reuse structure; redesign flows for teacher/student roles |
| Express API | server/server.js | Keep only as migration reference until authorization and error handling are rebuilt/tested |
| Socket.IO | server/server.js, client/src/pages/select.jsx | Reuse for teacher response-progress only after auth + tenant scoping |
| Sociogram visual | client/src/pages/sociogram.jsx | Reuse after data-contract review and accessibility/responsiveness tests |
| Graph / choice calculations | GET /api/social, client/src/pages/calcuData.jsx | Extract into tested pure functions; preserve validated semantics |

## 2. Gaps against product v0.1
| Priority | Gap / evidence | Required work |
| --- | --- | --- |
| P0 | Legacy email/password registration requests legal name, gender, phone; no Google OIDC | Build Google OAuth/OIDC teacher sign-in, minimal account table and session model |
| P0 | GET /api/groups returns groups globally; GET /api/social appears global and lacks visible auth | Apply per-teacher ownership authorization and classroom/session filters everywhere |
| P0 | POST /api/groups uses fixed owner u_id=2 | Derive ownership exclusively from authenticated teacher context |
| P0 | Student entry uses name + PIN (pin.jsx); student response references names | Shared QR → scoped session → number → nickname confirmation → opaque IDs |
| P0 | No demonstrated one-submit constraint; REST handler uses undefined db; select.jsx calls REST and Socket | Create one canonical write path, transaction, DB uniqueness and idempotent responses |
| P0 | Submitted students can still see the selection page; no demonstrated server-enforced lockout | Deny new session access after submission and eliminate readback endpoints |
| P0 | Sensitive analytics and live room participants exposed without observed privilege check | Student/teacher separation across REST, Socket.IO, exports and logs |
| P0 | Session secret hard-coded; MySQL root settings; no E2EE architecture | Secrets handling, least-privileged DB user, threat-model driven encryption prototype |
| P1 | Group PIN generated with Math.random and room identity not clearly tenant-scoped | CSPRNG-issued opaque public link tokens plus independent ownership/authorization |
| P1 | Source uses imported modules absent from package manifests | Reconcile dependencies and establish reliable clean-install/build/tests |
| P1 | Repeated name keys in graph logic can collide | Use opaque internal IDs; keep display mapping separate |
| P1 | No migration/DDL in repo visible | Document schema, data lifecycle, security indexes, backup and migration |
| P1 | No teacher supervised reset flow or audit trail | Build reset-with-reason, superseded response and rate limiting |
| P2 | No multi-period analytics or reporting controls | Build only after pilot validation |
| P2 | Business pricing, payments and school licenses not proven | Conduct pilot interviews and willingness-to-pay test |

## 3. Proposed phased execution
### Phase 0 — Preserve & document (this change)
- Save vision, requirements, security threat model, and observed gaps.
- No application code or database mutations.
- Plan implementation on a feature branch; preserve original graph algorithms for comparative tests.

### Phase 1 — Security feasibility POC (synthetic data only)
- Build minimal roster-read + encrypted-answer prototype in two browsers, verify no response key is given to students.
- Evaluate encryption vs browser script compromise, shared-QR forwarding, recovery on another teacher device and key loss.
- Decide cryptography and key-management architecture using a written ADR before production integration.
- Prototype unique response write and classroom-scoped authorization.

### Phase 2 — Core MVP
- Google teacher sign-in and teacher-owned classrooms.
- Roster with class number/nickname, teacher-created assessment sessions, one shared QR link.
- Student entry by number, nickname confirmation, peer selection, one-time atomic submit, teacher-only reset.
- Teacher progress dashboard, restricted Sociogram and verified graph results.
- Minimal metadata, admin permissions, log protection and basic deletion.

### Phase 3 — Hardening before real-school use
- Threat-model review and security testing; independent pentest and cross-tenant API/Socket tests.
- Full key lifecycle, incident response, backup, retention, privacy/legal review and pilot permissions.
- Run through scripted adversarial scenarios using entirely synthetic classroom data.
- Release gate: no live student data until all P0 issues have been fixed and verified.

### Phase 4 — Controlled pilot
- One supervised school/classroom pilot after security and governance approval.
- Measure teacher setup time, completion rate, mis-entry/reset incidence, confidence in interpretations, performance, willingness to pay.
- Decide whether to introduce institutional roles, longitudinal analysis, export and billing.

## 4. Next engineering tasks in order
1. Add reproducible development setup and restore missing declared dependencies.
2. Write tests that characterize existing graph calculation outputs with fixtures (including duplicates, nulls, cycles, mutual pairs).
3. Define data model and tenant/class/session boundary; choose persistence and migration strategy.
4. Implement Google teacher auth + session/ownership enforcement.
5. Build synthetic-data security POC/ADR for roster and response encryption.
6. Implement one-response-per-student invariant, teacher override audit and Socket permission checks.
7. Run automated testing + independent review before staging a real-data pilot.

## 5. Status of this documentation
This is an **evidence-based initial gap analysis**, not a completed application audit. Every P0 item needs code-level verification after implementation; a checked document is not equivalent to production readiness.
