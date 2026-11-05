# Product Requirements — Sociometry SaaS
Version: 0.1 (2026-11-05)
Legend: **Agreed** = established product behavior; **Proposed** = recommended implementation, pending design; **Open** = unresolved decision.

## A. Identity and classrooms
| ID | Requirement | Status |
| --- | --- | --- |
| R-01 | Teacher uses Google sign-in; teacher may return to own classrooms and assessments. | Agreed |
| R-02 | Do not require a school name or teacher legal name. Minimize Google profile fields; use stable provider subject, not email, as the primary identity key. | Agreed |
| R-03 | Teacher can create/edit a classroom with display label, class numbers and nicknames. | Agreed |
| R-04 | Do not require student legal names, email addresses, or official student identifiers. | Agreed |
| R-05 | Internal student/classroom/assessment IDs are opaque and scoped to ownership, not derived from class numbers or nicknames. | Proposed |
| R-06 | Same nickname or class label may occur in different classrooms; number must be unique only within its specific classroom. Handle nickname collisions visibly. | Proposed |

## B. Assessment
| ID | Requirement | Status |
| --- | --- | --- |
| R-07 | Teacher opens/closes each assessment session, and shares ONE common QR code/link with the class. | Agreed |
| R-08 | Student enters only own class number to start the default assessment; no student account, individual QR or personal PIN. | Agreed |
| R-09 | Student can confirm their displayed nickname after entering class number; the roster is shown to choose classmates correctly. | Agreed |
| R-10 | Student selects classmates according to teacher's question/allowed choices; cannot select themself; choices must belong to the same classroom and session. | Agreed / Proposed validation |
| R-11 | Allow only one successful submission per student per assessment session; after submission, deny re-entry to answer or read the submitted answers. | Agreed |
| R-12 | Student never sees other students' submitted answers or aggregated/individual Sociogram results. | Agreed |
| R-13 | Students with incorrect/unknown number or a previously consumed slot receive a neutral error; only teacher can resolve disputes. | Proposed |
| R-14 | Teacher may invalidate an old submission and allow a supervised replacement; avoid double counting and keep an audit trail without recording answers in logs. | Agreed intent / Proposed mechanics |
| R-15 | Teacher can see real-time response status, e.g., submitted vs not submitted, for own classrooms only. | Agreed |
| R-16 | Student is not forced to create an account or distribute additional recovery artifacts. | Agreed |

## C. Analytics
| ID | Requirement | Status |
| --- | --- | --- |
| R-17 | Retain Sociogram, rank/order choice counts, reciprocal selections, and cycle/group analysis subject to verification of mathematical correctness. | Agreed |
| R-18 | Scope all data and analytics by authorized teacher, classroom and assessment. | Agreed |
| R-19 | Show careful, non-diagnostic descriptions; distinguish 'not selected' from an explicit negative nomination/rejection. | Agreed |
| R-20 | Export, longitudinal analytics, extra assessment templates, and school-wide dashboards are subsequent phases. | Proposed |

## D. Security and data lifecycle
| ID | Requirement | Status |
| --- | --- | --- |
| R-21 | Outsiders and other teachers must not read student roster or relationship responses. | Agreed |
| R-22 | Strict API/Socket authorization for teacher operations; student access only to minimum assessment-specific actions. | Agreed |
| R-23 | Use HTTPS, secure teacher sessions, short-lived assessment access, abuse throttling, minimal logs, and access auditing. | Proposed controls |
| R-24 | Encrypt nicknames, class labels, and relationship answers at rest; evaluate browser-side E2EE with separate roster-read and answer-read capabilities. | Proposed — architecture decision pending |
| R-25 | Define retention/deletion, backups, disaster recovery, breach response, and legal basis with pilot schools before real data. | Open |
| R-26 | Treat class number as identifier only, never as secret authentication. Teacher supervises and resolves impersonation disputes. | Agreed |

## E. Acceptance scenarios (must be automated before production)
- Classroom A and classroom B can both have a student number 12 without collisions.
- Two students submit simultaneously for the same student/session: exactly one active submission is accepted, even across two app instances.
- Second attempt after successful submission cannot view or modify the original answer.
- Student cannot call analytics API, Socket handlers, exports, or other-student answer endpoints.
- Teacher T1 cannot read/edit classroom, results, or live events owned by T2 even by changing path IDs or guessing a QR code.
- Teacher closes a session: new answer submissions are rejected.
- A reset invalidates the previous answer; only the replacement counts; reset reason/time/actor are logged.
- Choice validation rejects self-selection, duplicates, invalid classroom IDs, and out-of-range counts.
- Failure during submission commits either all required changes or none (transaction + unique constraint).
- No nickname, choices, teacher tokens, or roster payload leaks via console, HTTP logs, browser URLs, or error telemetry.
- For proposed encryption: a database-only theft test cannot reveal roster or answers without keys; browser compromise remains an explicit residual risk.

## F. Questions intentionally not decided
1. E2EE/key design, enrollment link delivery, teacher recovery and teacher device changes.
2. Whether student browser receives an encrypted roster and how decryption is authorized without granting result access.
3. Database migration strategy and whether to keep MySQL or adopt PostgreSQL.
4. Retention period, backup duration, deletion SLA and school/pilot governance.
5. Payment model, pricing, multi-user school accounts and export/reporting permissions.
6. Operational response to a malicious actor consuming many numbers before class starts; controls must not force all students to carry individual codes.

The 'Agreed' labels describe product intent, not functionality already implemented in the current repository.
