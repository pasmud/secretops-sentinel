export interface DemoFindings {
  findings: Array<{
    RuleID: string;
    Description: string;
    File: string;
    Line: number;
    Commit: string;
    Secret: string;
    Severity: string;
  }>;
  repoPath: string;
}

export function getDemoFindings(): DemoFindings {
  return {
    repoPath: 'demo-fixture',
    findings: [
      {
        RuleID: 'aws-access-key',
        Description: 'AWS Access Key ID',
        File: 'config/credentials.py',
        Line: 5,
        Commit: 'a1b2c3d4e5f6g7h8i9j0',
        Secret: 'FAKE_TEST_ONLY_AKIAIOSFODNN7EXAMPLE',
        Severity: 'critical',
      },
      {
        RuleID: 'github-pat',
        Description: 'GitHub Personal Access Token',
        File: 'settings.json',
        Line: 12,
        Commit: 'b2c3d4e5f6g7h8i9j0k1',
        Secret: 'FAKE_TEST_ONLY_ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        Severity: 'high',
      },
      {
        RuleID: 'stripe-key',
        Description: 'Stripe Secret Key',
        File: '.env.example',
        Line: 3,
        Commit: 'c3d4e5f6g7h8i9j0k1l2',
        Secret: 'FAKE_TEST_ONLY_sk_live_xxxxxxxxxxxxxxxxxxxx',
        Severity: 'critical',
      },
      {
        RuleID: 'openai-key',
        Description: 'OpenAI API Key',
        File: 'keys.py',
        Line: 8,
        Commit: 'd4e5f6g7h8i9j0k1l2m3',
        Secret: 'FAKE_TEST_ONLY_sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        Severity: 'high',
      },
      {
        RuleID: 'generic-api-key',
        Description: 'Generic API Key',
        File: 'credentials.yml',
        Line: 15,
        Commit: 'e5f6g7h8i9j0k1l2m3n4',
        Secret: 'FAKE_TEST_ONLY_apt_xxxxxxxxxxxxxxxxxxxx',
        Severity: 'medium',
      },
      {
        RuleID: 'private-key',
        Description: 'RSA Private Key',
        File: 'keys/ssl/private.pem',
        Line: 1,
        Commit: 'f6g7h8i9j0k1l2m3n4o5',
        Secret: 'FAKE_TEST_ONLY_BEGIN RSA PRIVATE KEY-----',
        Severity: 'critical',
      },
    ],
  };
}
