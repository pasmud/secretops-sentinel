# Security Policy

## Responsible Use

SecretOps Sentinel is a defensive security tool for scanning local repositories for secrets.

## Supported Scope

- Your own repositories
- Repositories you have explicit permission to scan
- Local files on your machine

## What This Tool Does NOT Do

- Stores full secret values
- Sends findings to third parties
- Performs unauthorized scanning
- Exfiltrates data
- Modifies code without explicit user action

## Vulnerability Reporting

If you find a security issue in SecretOps Sentinel, please open a GitHub issue.

## Data Handling

- Secrets are stored with redacted values only
- Scan results are stored locally in SQLite
- No data is sent to external services
- Export reports may contain redacted findings

## Secret Redaction

All secret findings are automatically redacted. Full secrets are never displayed.
