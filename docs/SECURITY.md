# Security & Privacy — Threat Model (Draft)
Version: 0.1 (2026-11-05) · Not a security certification

## 1. Primary objective
An attacker outside a classroom/teacher account must not obtain readable student nicknames, classroom association, or sociometric choices. The system must also prevent access across teachers' classrooms and prevent students from seeing results. No design can guarantee zero risk.

### Data classification
- Teacher Google subject/account email: teacher account personal data; minimize fields and retention.
- Class label, class number, nickname: potentially identifying student personal data when combined with context, even without legal names.
- Directed sociometric choices and graph analytics: high-impact confidential records whose disclosure may harm students.
- Internal random IDs: pseudonymous identifiers; not a guarantee of anonymization.
- Operational metadata: request IP, user agent, timestamps, classroom link access; minimize collection and retention.

## 2. Threats and controls
| Threat | Impact | Planned controls |
| --- | --- | --- |
| Stolen database/backup | Disclosure of roster and choices | Encrypt data using well-reviewed algorithms, store keys separately, rotate/revoke as feasible; test real database-only compromise |
| Exposed source, secrets, or host | Loss of server control and possibly decryption keys | Secrets manager, secure deployment pipeline, dependency updates, restricted IAM, backups, monitoring |
| API object-ID tampering | Teacher reads another teacher's classroom | Ownership check for every object/action, tenant isolation, cross-tenant tests, DB protections where suitable |
| Stolen teacher session/Google account | Unauthorized result access | Verified OIDC sign-in, secure HttpOnly/SameSite cookies, session expiry/revocation, re-auth for sensitive actions |
| Student invokes teacher API/Socket | Reads analytical results | Separate capability model and server-side authorization for HTTP and Socket.IO events |
| Guessed classroom number or QR forwarded | Impersonation and consumed submission slots | Time-scoped teacher-open session, rate limits, teacher monitoring/assisted reset; document residual weakness |
| Replay/concurrent submit | Duplicate/overwritten answers | DB unique(survey_id,student_id), atomic transaction/conditional insert, idempotency if needed |
| XSS/compromised frontend | Exposure after browser decrypts | CSP, dependency/CI checks, output escaping, third-party script minimization, secure release pipeline; E2EE alone cannot solve this |
| Overly detailed logs/exports | Leak via operational systems | No student payload/answers in logs, minimal retention, audit actor/action only, secure export permission |

## 3. Proposed encryption boundary — DECISION NOT FINAL
Two implementation options must be prototyped and reviewed before claiming E2EE:

**Option A — Server-side encryption with separated key service:** easier teacher/student experience but compromised application servers may access decryptable data. Useful as baseline protection at rest, not zero-knowledge.

**Option B — Client-side encryption / E2EE-oriented design:** browser encrypts student roster; student browser receives only a roster-read capability; completed answer is encrypted to a teacher-only results key; cloud stores ciphertext and limited routing/status metadata; teacher browser decrypts and computes the graph. Server must not hold the results private key. Evaluate how a shared QR carries a roster-read capability without making answers/results public, and how keys recover on new devices. Students can necessarily read the roster that they are authorized to select from. QR recipients can potentially forward that access.

**Caveat:** If an attacker modifies scripts served by the SaaS, captures a teacher device, steals a roster-read link, or gains access to keys, client-side encryption does not prevent disclosure. Never advertise 'zero knowledge' without an independently reviewed threat model and implementation.

## 4. Policy for class-number-based entry
The class number is NOT a password. No mandatory student PIN, individual QR or student Google sign-in in the default flow.
- Opening the form is limited to a teacher-controlled assessment window.
- A successful submission consumes a single slot.
- A collision/dispute is investigated by the teacher; teacher resets with reason under supervision.
- A server-side one-time lock **does not establish** that the answer came from the correct child.
- Handle rate limits and enumeration carefully so an attacker cannot cheaply lock out an entire class.

## 5. Data minimization & retention
- Required student roster fields: class label, number, nickname. Do not add legal names, student ID, school name, photos or phone numbers by default.
- Teacher account: prefer only OIDC subject, optional email if strictly needed; do not collect name/phone/gender/school by default.
- No student answer content in URLs, telemetry, analytics SDKs, error reports, or access logs.
- Draft/define retention, deletion, backup aging, admin access reviews, and breach-response procedures before a real-school pilot.
- Encrypt backups, segregate environments, and avoid production student data in development/test.
- Privacy notice, legal basis, role allocation (school vs SaaS operator), and data processing agreement require review in the actual school context. Minimal collection is not equivalent to no PDPA duties.

## 6. Release gates (must pass before any real student data)
1. Independent security review of authentication, teacher ownership, student links, cryptography and key recovery.
2. Automated access-control tests including cross-tenant negative tests for REST and Socket.IO.
3. Concurrency tests for double submissions and reset semantics.
4. Secrets scanning, dependency audit, no hard-coded secrets, CSRF/CORS/session review.
5. Documented incident playbook, monitoring, limited access, and tested backup/restore/deletion.
6. School-led privacy/legal and child-safety review; clear educational interpretation guidance.

## 7. Observed existing code risks (static inspection, NOT a live exploit assessment)
- server/server.js: a hard-coded session secret; permissive app-level CORS middleware; session defaults need production review.
- server/server.js: group creation assigns owner u_id=2, rather than session user.
- server/server.js: GET /api/groups and GET /api/social contain no visible teacher authorization or per-classroom filtering.
- server/server.js: POST /api/select_submit references an undefined db variable and uses names to look up answer identities; no observed atomic one-submission enforcement.
- client/src/pages/select.jsx: one click initiates both REST submission and Socket event, risking inconsistent behavior.
- server/server.js Socket.IO: joins rooms based on supplied PIN and username; no visible verification/authorization.
- client/src/pages/select.jsx and server/server.js: student names/choices/presence may be printed in logs.
- server/config.js: DB connection uses local root user; not suitable for production.
- API code uses student names in result calculations; identity separation is not implemented.
- server/package.json and client/package.json do not list several libraries imported in source. Runtime/build verification is required.

Do not treat existing routes as safe for production. No live penetration test, dependency install, database schema verification or functional build was performed in this documentation phase.
