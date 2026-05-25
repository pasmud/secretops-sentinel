# SecretOps Sentinel - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite + TypeScript + Tailwind CSS)         │  │
│  │  - Dashboard                                          │  │
│  │  - Scan Runner                                        │  │
│  │  - Workflow Manager                                   │  │
│  │  - Rotation Checklists                                │  │
│  │  - Allowlist Generator                                │  │
│  │  - Pre-commit Guide                                   │  │
│  │  - Report Exporter                                    │  │
│  └───────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────┼──────────────────────────────────┐
│  Express API Server (Node.js + TypeScript)              │
│  ┌─────────────────────────────────────────────────────┐│
│  │  /api/scan        - POST - Run scan on repo path   ││
│  │  /api/findings    - GET  - List findings           ││
│  │  /api/findings/:id - PATCH - Update workflow state ││
│  │  /api/allowlist   - POST - Generate allowlist      ││
│  │  /api/rotation/:type - GET - Rotation checklist    ││
│  │  /api/report      - POST - Export incident report  ││
│  │  /api/precommit   - GET  - Pre-commit hook guide   ││
│  │  /api/gitleaks/check - GET - Check gitleaks install││
│  └─────────────────────────────────────────────────────┘│
│                         │                                 │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │  Scanner Service                                    │  │
│  │  - Gitleaks wrapper (child_process)                │  │
│  │  - Demo fixture fallback                           │  │
│  │  - Result parser + redactor                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │  Prisma ORM + SQLite                                │  │
│  │  Tables: findings, workflow_events, allowlists,     │  │
│  │          scan_runs                                   │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Component Tree (Frontend)

```
App
├── Layout
│   ├── Header (warning banner + nav)
│   └── Main
├── Pages
│   ├── ScanPage
│   │   ├── RepoPathInput
│   │   ├── GitleaksStatus
│   │   └── ScanButton
│   ├── DashboardPage
│   │   ├── FindingsTable
│   │   │   └── FindingRow (redacted display)
│   │   ├── Filters (type, status, severity)
│   │   └── BulkActions
│   ├── FindingDetailPage
│   │   ├── FindingInfo (redacted)
│   │   ├── WorkflowTimeline
│   │   ├── StateTransitionForm
│   │   └── RotationChecklistPanel
│   ├── RotationChecklistsPage
│   │   └── ChecklistView (per type)
│   ├── AllowlistPage
│   │   ├── SuggestionList
│   │   └── AllowlistPreview
│   ├── PreCommitPage
│   │   └── SetupGuide
│   ├── ReportsPage
│   │   └── ExportButton
│   └── DemoFixturePage
│       └── FixtureSetupGuide
```

## Data Flow

1. **Scan**: User enters path → POST /api/scan → Scanner validates path → runs gitleaks (or demo) → parses results → redacts secrets → stores in SQLite → returns findings
2. **View**: GET /api/findings → Prisma query → return redacted findings
3. **Update State**: PATCH /api/findings/:id → validate transition → create workflow_event → update finding status
4. **Export**: POST /api/report → gather findings + events → generate Markdown → return as file

## Redaction Strategy
- Store `partial_match` in DB: first 4 chars + "..." + last 4 chars
- Full match only exists transiently in memory during scan
- Any full secret in logs is stripped before writing

## Security Boundary
- All secret data redacted before leaving scanner service
- Database never contains full secrets
- API responses never include full secrets
- Frontend only receives redacted strings
