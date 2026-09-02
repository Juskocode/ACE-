# ACE architecture

ACE starts as a modular monolith. This keeps local development and deployment simple while protecting module boundaries that can later be extracted if scale warrants it.

## Runtime flow

```text
Official RSS / APIs / permitted pages
                  |
                  v
       ingestion + provenance
                  |
       materials / news / question drafts
                  |
          clinician review gate
                  |
          published question pool
                  |
   deterministic exam generation (seed)
                  |
       responses + timing + confidence
                  |
    versioned readiness snapshots -> analytics UI
```

## Backend modules

- `questionbank`: version-ready question records and database access.
- `assessment`: deterministic selection, filtering, constraint notes and frozen exam manifests.
- `materials`: grouped study sources and reading progress.
- `news`: normalized updates linked to matrix areas.
- `ingestion`: source catalogue and the boundary for RSS/API/web adapters.
- `analytics`: reproducible readiness snapshots.
- `dashboard`: learner-facing aggregation.
- `shared`: HTTP configuration and consistent API errors.

Flyway owns the schema. H2 provides a zero-setup local database; the `postgres` profile switches to PostgreSQL without changing application code.

## Readiness model

The MVP index is intentionally explainable:

- 55% recency-weighted topic mastery;
- 20% blueprint-weighted syllabus coverage;
- 15% study and assessment recency;
- 10% pacing against the current exam format.

Snapshots are stored so historic charts do not change when the formula evolves. The interface always shows confidence and sample-size context. It never describes the score as a probability of placement.

## Content lifecycle

Source records retain the canonical URL, authority, publication/update/retrieval dates, matrix link, effective status, licence state and checksum. Generated or transformed questions enter `Rascunho`; only clinically reviewed versions become eligible for exam generation. Historical exam items should point to immutable question versions when persistence is expanded beyond the seeded MVP.

Commercial PNA bibliography is alignment metadata only unless a licence explicitly permits ingestion. Candidate lists and identifiable clinical data are excluded.
