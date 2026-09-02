# ACE architecture

ACE is a two-tier application with a React/Vinext frontend and a modular-monolith Spring Boot backend backed by one relational database. This keeps the demonstrator easy to run while preserving boundaries that can evolve independently.

## Runtime topology

```text
Browser
  ├── read UI and same-origin API calls ──> React 19 / Vinext
  │                                            │
  │                                            └──> Spring Boot /api/v1
  └── manual source refresh ─────────────> server-side proxy
                                               │ adds ingestion key
                                               v
                                        Spring Boot ingestion
                                               │
                             allowlisted RSS / Atom / HTML pages

Spring Boot ──> H2 (local) or PostgreSQL (Docker profile)
```

The browser never receives `ACE_INGESTION_KEY`. The frontend server uses it only when forwarding `/api/source-sync` to the protected Java endpoint. This authenticates the frontend-to-backend hop, not the person calling the unauthenticated proxy from a shared preview.

## Backend modules

| Module | Responsibility today |
| --- | --- |
| `questionbank` | Read seeded question records and expose filters |
| `assessment` | Select and shuffle exam questions using a supplied seed |
| `materials` | Read grouped demonstration materials |
| `news` | Read normalized update records |
| `ingestion` | List configured sources and execute bounded manual refreshes |
| `analytics` | Read seeded readiness snapshots |
| `dashboard` | Assemble the demonstration learner overview |
| `shared` | HTTP configuration and consistent API error responses |

Flyway owns the schema and seeds. H2 provides file-backed local persistence; the `postgres` Spring profile switches the same repositories to PostgreSQL.

## Exam generation

`POST /api/v1/exams/generate` receives the requested size, areas, difficulty, weak-topic preference and seed. The assessment service:

1. loads eligible demonstration records;
2. applies the requested filters and weighting;
3. avoids duplicates within the generated set;
4. shuffles selection and order from the supplied seed;
5. returns the questions plus manifest notes.

The returned exam is reproducible with the same data and seed, but it is not persisted. Its duration is descriptive metadata; there is no countdown. Weak-topic boosting currently uses a fixed demonstration area set rather than learner evidence.

The generated exam lives in the current app mount. Practice answers and flags live inside the mounted practice view and are discarded when the user navigates away from it.

## Source ingestion safeguards

Manual ingestion currently implements:

- a server-side API key;
- a strict source identifier format;
- a configured host allowlist for source, redirect and item URLs;
- XML external-entity protections;
- connection, request, redirect and 2 MB response limits;
- exact resolved-URL news-item deduplication;
- one active run per source and backend process;
- a configurable 120-second cooldown per source and backend process;
- structured, user-safe error responses.

The current ingestion layer is a constrained prototype. It does **not** yet provide a scheduler, robots checks, permission/licence records, canonical-link normalization, checksum/version history or removed-document lifecycle management. It uses one generic XML/HTML parser; maintained source-specific adapters and periodic quality review are still needed.

## Readiness model

The interface presents an explainable illustrative formula:

- 55% recent topic accuracy;
- 20% syllabus coverage;
- 15% study and assessment recency;
- 10% pacing against the exam format.

In the current repository, readiness history, learner identity, activity and recommendations are seeded. Practice interactions do not yet persist or recalculate the score. The UI therefore describes readiness as an educational estimate and never as a probability of score, rank, specialty or placement.

## Current persistence boundaries

| Data | Persistence |
| --- | --- |
| Questions, materials, news, source catalogue | Relational database |
| Ingestion runs and newly discovered news URLs | Relational database |
| Generated exam manifest | Current app mount only |
| Practice answers and review flags | Current practice-view mount only |
| Learner profile and dashboard activity | Seeded service response |
| Readiness history | Seeded database snapshots |

## Intended evolution

The existing boundaries leave room for:

1. authenticated learner profiles and persistent attempts;
2. recalculation of readiness from real answer, timing and coverage evidence;
3. immutable question revisions and a clinician review workflow;
4. source-specific scheduled adapters with rights and robots-policy records;
5. persisted exam manifests that reference immutable question versions.

These are architectural directions, not claims about the current demonstrator.

The current clinical-review field is metadata only; exam selection does not yet enforce it as an eligibility gate.
