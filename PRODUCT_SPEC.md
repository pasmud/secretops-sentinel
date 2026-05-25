# SecretOps Sentinel - Product Specification

## Overview
SecretOps Sentinel is a web application for scanning local git repositories for accidentally committed secrets, managing remediation workflows, and generating incident reports. It wraps Gitleaks (or provides demo/mocked findings when Gitleaks is not installed) with a user-friendly dashboard, rotation checklists, and exportable incident reports.

## User Journey
1. User enters a local repo path → system validates it exists
2. Scan runs (Gitleaks if installed, otherwise demo fixture) → findings appear in dashboard
3. Dashboard shows findings: secret type, file path, line, commit, redacted match, severity, confidence
4. User can change workflow state: detected → confirmed → revoked → rotated → history cleaned → closed, or false positive
5. User can generate rotation checklist templates per secret type
6. User can generate `.gitleaks.toml` allowlist suggestions from false positives
7. User can view pre-commit hook setup instructions
8. User can export incident-style Markdown report

## Core Features

### Feature 1: Repository Scanner
- Input: local filesystem path
- Validate path is a directory (git repo not strictly required)
- Run `gitleaks detect --source <path> --report-path <tmp> --json` if gitleaks is available
- Parse JSON output into normalized findings
- Fallback: scan demo fixture repo with known fake secrets

### Feature 2: Findings Dashboard
- Table with columns: secret type, file path, line, commit (abbreviated), redacted match, severity, confidence, status
- Redacted match: show first 4 chars + "..." + last 4 chars (minimum useful context, never full secret)
- Sortable by severity, status, date
- Filterable by secret type, status

### Feature 3: Workflow States
- detected → confirmed → revoked → rotated → history cleaned → closed
- false positive (terminal state, branches from detected/confirmed)
- Each transition is timestamped
- Notes/comment per state transition

### Feature 4: Rotation Checklists
Templates for:
- GitHub Personal Access Token
- AWS Access Key
- Stripe Secret Key
- OpenAI API Key
- Generic API Key
- SSH/RSA Private Key

Each checklist includes:
- Step-by-step instructions
- Verification steps
- Links to provider docs

### Feature 5: Allowlist Suggestions
- Analyze false positive findings
- Generate `.gitleaks.toml` allowlist entries
- Group by path, regex, or commit
- Require manual review before accepting

### Feature 6: Pre-commit Hook Guide
- Show platform-specific instructions (Windows, macOS, Linux)
- Generate pre-commit hook script
- Explain `.gitleaks.toml` configuration

### Feature 7: Incident Report Export
- Markdown format
- Includes: summary, findings table, workflow timeline, rotation actions taken, recommendations
- Filename: `incident-report-<date>.md`

## Non-Goals
- Scanning remote repositories
- Automatic secret rotation
- Network scanning
- Storing full secret values anywhere
- Sending findings to external services

## Safety Constraints
- Never display full secret values in UI
- Never store full secret values in database
- Never send findings externally
- Fake demo secrets must be clearly marked as invalid
- Warning banner on all pages: "Only scan systems you own or are authorized to test"
