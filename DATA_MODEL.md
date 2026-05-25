# SecretOps Sentinel - Data Model

## Entity Relationship

```
ScanRun
  id            String (UUID)
  repoPath      String
  gitleaksUsed  Boolean
  startedAt     DateTime
  completedAt   DateTime?
  status        String (running, completed, failed)
  totalFindings Int
  errorMessage  String?

Finding
  id              String (UUID)
  scanRunId       String (FK → ScanRun)
  ruleId          String
  secretType      String (e.g. "AWS Access Key", "GitHub Token")
  filePath        String
  lineNumber      Int
  commitSHA       String (abbreviated to 8 chars)
  redactedMatch   String (first 4 + "..." + last 4)
  severity        String (critical, high, medium, low)
  confidence      String (high, medium, low)
  authorName      String?
  authorEmail     String?
  date            DateTime?
  workflowState   String (detected, confirmed, revoked, rotated, history_cleaned, closed, false_positive)
  createdAt       DateTime
  updatedAt       DateTime

WorkflowEvent
  id          String (UUID)
  findingId   String (FK → Finding)
  fromState   String?
  toState     String
  note        String?
  createdAt   DateTime

AllowlistSuggestion
  id            String (UUID)
  findingId     String (FK → Finding)
  ruleId        String
  matchValue    String (redacted)
  suggestionType String (path, regex, commit)
  allowlistValue String
  rationale     String
  accepted      Boolean (default false)
  createdAt     DateTime

RotationChecklist
  id            String (UUID)
  findingId     String (FK → Finding)
  secretType    String
  steps         JSON (array of step objects)
  completed     Boolean (default false)
  createdAt     DateTime
  completedAt   DateTime?

Step Object (JSON):
  { order: Int, description: String, verified: Boolean, notes: String? }
```

## State Machine (Finding.workflowState)

```
                  ┌──────────┐
                  │ detected │
                  └────┬─────┘
                       │
                  ┌────▼─────┐
           ┌──────│ confirmed │──────┐
           │      └────┬──────┘      │
           │           │             │
    ┌──────▼───┐ ┌─────▼──────┐     │
    │ false    │ │ revoked    │     │
    │ positive │ └─────┬──────┘     │
    └──────────┘       │            │
                  ┌────▼──────┐     │
                  │ rotated   │     │
                  └────┬──────┘     │
                       │            │
                  ┌────▼────────┐   │
                  │ history     │   │
                  │ cleaned     │   │
                  └────┬────────┘   │
                       │            │
                  ┌────▼────┐       │
                  │ closed  │◄──────┘
                  └─────────┘
```

Allowed transitions:
- detected → confirmed, false_positive
- confirmed → revoked, false_positive
- revoked → rotated, false_positive
- rotated → history_cleaned, false_positive
- history_cleaned → closed, false_positive
- closed → (terminal)
- false_positive → (terminal)
