# ACE-

ACE is a full-stack study workspace for Portuguese doctors preparing for the **Prova Nacional de Acesso à Formação Especializada (PNA)**.

It combines a versioned question pool, deterministic mixed-exam generation, grouped learning materials, official-source feeds, practice sessions, and an explainable readiness dashboard. The seeded experience is a demonstrator: it is not official PNA material and does not predict placement.

## Project structure

```text
ACE-/
├── backend/       Spring Boot 4 / Java 21 API, H2/PostgreSQL, Flyway
├── frontend/      React 19 / TypeScript / Vinext, shadcn primitives, Recharts
├── docs/          Architecture and data-governance notes
├── scripts/       Local development helpers
└── docker-compose.yml
```

## Run locally

Requirements: Java 21+, Maven 3.9+, Node 22+ and npm.

```bash
./scripts/dev.sh
```

Open <http://localhost:3000>. In local development the frontend connects to the Java backend on port `8080`.

Run verification separately:

```bash
cd backend && mvn test
cd ../frontend && npm run lint && npm run build
```

## Main API routes

- `GET /api/v1/dashboard`
- `GET /api/v1/questions`
- `POST /api/v1/exams/generate`
- `GET /api/v1/materials`
- `GET /api/v1/news`
- `GET /api/v1/analytics/readiness`
- `GET /api/v1/sources`
- `GET /actuator/health`

## Content safeguards

- Generated questions are drafts until clinically reviewed.
- Every item keeps its authority, canonical URL, retrieval metadata, and source label.
- RSS/API ingestion is preferred; scraping must respect publisher terms, robots policy, and licences.
- The readiness index is an educational estimate based on activity in ACE. It does not guarantee a score, rank, vacancy, specialty, or placement.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the module map and readiness formula.
