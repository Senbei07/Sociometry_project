# Product Vision — Privacy-First Sociometry SaaS
Version: 0.1 (2026-11-05) · Status: Product direction agreed; implementation not started

## 1. Purpose
Transform the existing Sociometry classroom prototype into a web-based SaaS for Thai teachers and guidance staff, prioritizing ease of use, minimal student information, and preventing outsiders from reading student choices.

**Value proposition:** A teacher creates a classroom and assessment; students scan one shared QR code, enter their class number, select classmates by nickname, and submit once; only the authorized teacher can view the Sociogram and analysis.

## 2. Target users and boundaries
- Teacher: signs in with a Google account; teacher's account identifier is needed for access control. Do not require school name, teacher's legal name, phone number, gender, or other unrelated registration fields.
- Student: no account, email, password, individual QR or individual PIN is required for the default workflow.
- Classroom roster: class label, class number, nickname only. No student legal name, student ID number, or school name as required fields.
- The system creates opaque identifiers internally; class number is a user-facing identifier, not proof of identity or an authorization secret.
- One web application for teacher and student. Avoid parallel manual files, external apps, or mandatory distribution of private codes.

## 3. Core workflows
### Teacher
Google sign-in → create classroom → enter roster (class number + nickname) → configure assessment → open a session → display one shared QR code → monitor submitted / not submitted → close session → review restricted Sociogram.

### Student
Scan the shared classroom assessment QR → enter own class number → see the corresponding nickname for confirmation → choose classmates from the roster → review selections → submit → see only a receipt/success state. No viewing or editing answers after a successful submission.

### Exception handling
If a student reports impersonation, a mistaken submission, or access being consumed, the teacher may invalidate the previous submission and allow a supervised retake. This must be an explicit, audited teacher action; do not silently double-count.

## 4. Product priorities
1. Easy enough to run during a regular classroom period without training or student accounts.
2. Limit the data collected and protect relationship responses against unauthorized access and exfiltration.
3. Strict separation: students cannot read submitted answers or group/individual analytics.
4. Protect each teacher's classrooms from all other teachers/tenants, including direct API access.
5. Preserve and verify existing Sociogram/graph-calculation capabilities where correct, rather than rewriting without tests.
6. Explain analysis cautiously: a missing incoming choice is not evidence of bullying, rejection, or a psychological diagnosis.

## 5. Risks and deliberate trade-offs
- Entering a class number alone cannot authenticate a student. Collusion, guessed numbers, and impersonation remain possible; teacher supervision and an audited recovery flow are the accepted default UX trade-off.
- A one-submission lock prevents duplicate answers but does not prove the sender's identity.
- Class number + nickname + class label can still identify a child within context. Minimal-data design does not make the dataset anonymous or automatically exempt it from privacy law.
- Client-side/end-to-end encryption is a proposed security direction, not an implemented or approved technical design. Browser code compromise and key sharing are meaningful risks.
- Teacher Google identity is an intentionally collected account datum; 'no teacher data' cannot literally describe the whole system.

## 6. Business direction (hypotheses, not commitments)
- Initial buyer: Thai teachers/guidance staff; possible institutional buyer later.
- Pricing, quotas, school license, payment provider, consent/legal basis, and go-to-market are not decided.
- Validate with a small teacher pilot and actual willingness to pay before building billing or broad multi-tenant rollout.

## 7. Out of scope for this documentation change
No application refactor, database migration, new authentication integration, live data import, payment integration, or production deployment.

See [REQUIREMENTS.md](REQUIREMENTS.md), [SECURITY.md](SECURITY.md), and [ROADMAP.md](ROADMAP.md).
