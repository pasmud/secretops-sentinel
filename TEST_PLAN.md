# SecretOps Sentinel - Test Plan

## Unit Tests (Vitest)

### Backend
- `ScannerService`: mock gitleaks output parsing, redaction logic, demo fixture scan
- `RedactionHelper`: verify partial redaction produces correct format
- `WorkflowService`: verify valid/invalid state transitions
- `AllowlistGenerator`: verify suggestion generation from false positives
- `ReportGenerator`: verify Markdown output format and content
- Findings API: CRUD operations with edge cases

### Frontend
- `FindingRow`: renders redacted secret correctly
- `WorkflowTimeline`: shows correct state history
- `StateTransitionForm`: validates allowed transitions
- `Filters`: correctly filters findings list

## Integration Tests (Vitest)

- API endpoint tests with supertest
- Full scan flow: POST /api/scan → findings appear in GET /api/findings
- State transition flow: PATCH /api/findings/:id → events created
- Report export: POST /api/report → valid Markdown returned

## E2E Tests (Playwright)

### Test 1: Demo Fixture Scan
1. Navigate to app
2. Enter demo fixture path (or click "Scan Demo Fixture" button)
3. Click Scan
4. Verify findings table shows redacted secrets
5. Verify no full secrets visible in UI

### Test 2: Workflow State Change
1. Scan demo fixture
2. Click on a finding
3. Change state from detected → confirmed
4. Add note
5. Verify timeline shows the transition

### Test 3: Full Remediation Flow
1. Scan demo fixture
2. Select a finding
3. Mark as confirmed
4. View rotation checklist for the secret type
5. Mark as revoked
6. Mark as rotated
7. Mark as history cleaned
8. Mark as closed
9. Verify final state

### Test 4: Report Export
1. Scan demo fixture
2. Change state of one finding
3. Click Export Report
4. Verify downloaded file is valid Markdown
5. Verify report includes finding details and timeline

### Test 5: Allowlist Suggestion
1. Scan demo fixture
2. Mark a finding as false positive
3. Go to allowlist page
4. Verify suggestion appears
5. Verify suggestion requires manual acceptance

### Test 6: Safety Verification
1. Scan demo fixture
2. Inspect all UI elements for full secret values
3. Verify no full secrets displayed
4. Inspect API responses (via network tab) - no full secrets

## Test Fixtures

### Demo Repository
Located at `tests/fixtures/demo-repo/` with:
- `config.py` - fake AWS key: `FAKE_TEST_ONLY_AWS_ACCESS_KEY_ID`
- `settings.json` - fake GitHub token: `FAKE_TEST_ONLY_ghp_xxxxxxxxxxxxxxxxxxxx`
- `.env.example` - fake Stripe key: `FAKE_TEST_ONLY_sk_live_xxxxxxxxxxxxxxxxxxxx`
- `keys.py` - fake OpenAI key: `FAKE_TEST_ONLY_sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- `credentials.yml` - fake generic API key: `FAKE_TEST_ONLY_apt_xxxxxxxxxxxxxxxxxxxx`

All secrets prefixed with `FAKE_TEST_ONLY_` to be clearly invalid.

## Test Commands
```bash
# Unit + integration
npm run test

# E2E
npm run test:e2e

# Coverage
npm run test:coverage
```
