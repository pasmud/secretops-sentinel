# SecretOps Sentinel

Secret scanning, redaction, rotation workflow, and pre-commit helper for local repositories.

## Features

- **Repository Scanning**: Scan local git repos for secrets using Gitleaks (or demo mode)
- **Findings Dashboard**: View redacted findings with severity, type, file location, and workflow state
- **Workflow States**: Track findings through detected → confirmed → revoked → rotated → history cleaned → closed
- **Rotation Checklists**: Step-by-step guides for rotating different secret types (AWS, GitHub, Stripe, OpenAI, etc.)
- **Allowlist Suggestions**: Auto-generate `.gitleaks.toml` allowlist entries from false positives
- **Pre-Commit Hook Guide**: Platform-specific instructions for setting up Gitleaks pre-commit hooks
- **Incident Reports**: Export Markdown incident reports with findings, timeline, and recommendations

## Safety

- **Never displays full secret values** - secrets are redacted to show only first 4 + last 4 characters
- **Never stores full secrets** - database only contains redacted/partial values
- **Never sends findings externally** - all data stays local
- **Demo fixtures use clearly fake secrets** - all prefixed with `FAKE_TEST_ONLY_`

## Quick Start

### Prerequisites

- Node.js 18+
- Gitleaks (optional, for real scanning - download from [gitleaks.io](https://gitleaks.io))

### Installation

```bash
git clone https://github.com/yourusername/secretops-sentinel.git
cd secretops-sentinel
npm install
npm run db:generate --prefix server
npm run db:push --prefix server
```

### Run Development

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:42000
- Backend API: http://localhost:42001

### Docker

```bash
docker compose up --build
```

## Usage

1. Open http://localhost:42000
2. Enter a local repo path and click **Scan**, or click **Scan Demo Fixture**
3. View findings in the **Dashboard**
4. Click a finding to see details and manage its workflow state
5. Use **Rotation** tab for remediation checklists
6. Use **Allowlist** to manage false positives
7. Use **Reports** to export incident reports
8. Use **Pre-Commit** for hook setup instructions

## Testing

```bash
# Unit and integration tests
npm test

# E2E tests
npm run test:e2e
```

## Architecture

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite via Prisma ORM
- **Testing**: Vitest (unit), Playwright (E2E)
- **Container**: Docker with docker-compose

## License

MIT

## Warning

Only scan systems, code, APIs, and infrastructure you own or are authorized to test.
