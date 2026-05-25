# Research Notes - SecretOps Sentinel

## Gitleaks Overview

Gitleaks is an open-source tool for detecting secrets (passwords, API keys, tokens) in git repos, files, or stdin. It is written in Go and is MIT-licensed.

### Key Capabilities
- **Git scanning**: Uses `git log -p` to scan patches across entire commit history
- **Directory scanning**: Scans files and directories (no git required)
- **stdin scanning**: Accepts piped data
- **Pre-commit hook**: Uses `gitleaks protect --staged` to check staged changes
- **CI/CD integration**: Official GitHub Action `gitleaks/gitleaks-action`
- **SARIF output**: Compatible with GitHub Code Scanning

### Detection Engine
- 150+ built-in regex patterns for common secret types (AWS keys, GitHub tokens, Stripe keys, etc.)
- Shannon entropy threshold filtering to reduce false positives
- Aho-Corasick trie for keyword-based prefiltering (performance optimization)
- Multi-part/composite rules for proximity-based detection
- Configurable decoding depth for encoded secrets
- Archive extraction for nested archives (zip, tar)

### Allowlisting
- Per-rule allowlists: regex, commit SHA, file path, stopwords
- Global allowlists in `.gitleaks.toml`
- Inline `gitleaks:allow` comments
- Baseline support to ignore pre-existing findings

### Output
- JSON format with: rule ID, commit, file path, line number, redacted secret, author, email, date
- SARIF format for GitHub integration

### Installation
- Homebrew: `brew install gitleaks`
- Docker: `docker pull gitleaks/gitleaks`
- Go: `go install github.com/gitleaks/gitleaks@latest`
- Binary releases on GitHub

## Secret Scanning Best Practices

### Layered Defense
1. **Pre-commit hooks**: Fastest feedback loop, catches before commit
2. **CI/CD scanning**: Mandatory gate before merge (cannot be bypassed)
3. **Continuous monitoring**: Periodic full-history scans
4. **GitHub push protection**: Server-side blocking

### Remediation Workflow
1. **Detect**: Scanner finds potential secret
2. **Confirm**: Manual review determines if it's a real secret
3. **Revoke**: Immediately rotate/revoke the credential
4. **Rotate**: Replace with new credential in secret manager
5. **Clean history**: Use `git filter-repo` to remove from git history
6. **Close**: Document and close the incident

### Secret Rotation
- Each secret type has specific rotation procedure
- AWS keys: Deactivate old, create new via IAM console/CLI
- GitHub tokens: Regenerate in GitHub settings
- Stripe keys: Roll from Stripe dashboard
- Generic: Depends on the system

## Safe Redaction
- Never display full secret values in UI
- Show only first N characters + type/context
- Redact matches in reports: `AKIA***************`
- Store only hashed/partial values in database
- Clear secrets from memory after processing

## Developer Workflow Integration
- Pre-commit hook setup via `.husky/pre-commit` or `.git/hooks/pre-commit`
- `.gitleaks.toml` in repo root for project-specific config
- GitHub Actions workflow for CI scanning
- Incident response playbook for leaked secrets

## Technologies for SecretOps Sentinel
- **Gitleaks**: Primary scanning engine
- **Node.js/TypeScript**: Backend API (Express/Fastify)
- **React/Vite/TypeScript**: Frontend dashboard
- **SQLite + Prisma**: Lightweight database for findings
- **Docker**: Containerized deployment
- **Playwright**: E2E testing
- **Vitest**: Unit/integration testing
