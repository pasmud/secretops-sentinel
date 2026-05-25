import { Router } from 'express';
import { platform } from 'os';

export const precommitRouter = Router();

precommitRouter.get('/', async (_req, res) => {
  const isWindows = platform() === 'win32';
  const instructions = generateInstructions(isWindows);
  res.json({ instructions, platform: isWindows ? 'windows' : 'unix' });
});

precommitRouter.get('/script', async (_req, res) => {
  const isWindows = platform() === 'win32';
  const script = isWindows ? generateWindowsScript() : generateUnixScript();
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="pre-commit"');
  res.send(script);
});

function generateInstructions(isWindows: boolean) {
  return {
    summary: 'Set up Gitleaks as a pre-commit hook to automatically scan staged changes before each commit.',
    steps: [
      {
        title: 'Install Gitleaks',
        command: isWindows
          ? 'Download from https://github.com/gitleaks/gitleaks/releases and add to PATH'
          : 'brew install gitleaks  # macOS\\nor\\nsudo apt install gitleaks  # Linux',
      },
      {
        title: 'Create pre-commit hook',
        command: 'Copy the pre-commit script to .git/hooks/pre-commit in your repository',
      },
      {
        title: 'Make it executable',
        command: isWindows
          ? 'No action needed on Windows (checked via git hooks)'
          : 'chmod +x .git/hooks/pre-commit',
      },
      {
        title: 'Test the hook',
        command: 'Try committing a file with a test secret like "AKIAIOSFODNN7EXAMPLE" - the commit should be blocked',
      },
      {
        title: 'Add .gitleaks.toml for project configuration',
        command: 'Create a .gitleaks.toml file in your repo root for allowlists and custom rules',
      },
    ],
  };
}

function generateUnixScript(): string {
  return `#!/bin/sh
# Gitleaks pre-commit hook
# Install: copy to .git/hooks/pre-commit and chmod +x

exec gitleaks protect --staged --no-color 2>/dev/null
if [ $? -eq 1 ]; then
  echo "[-] Gitleaks detected secrets in staged changes"
  echo "[-] Commit blocked. Review and fix before committing"
  exit 1
fi
`;
}

function generateWindowsScript(): string {
  return `@echo off
REM Gitleaks pre-commit hook for Windows
REM Install: copy to .git/hooks/pre-commit

gitleaks protect --staged --no-color 2>nul
if %ERRORLEVEL% equ 1 (
  echo [-] Gitleaks detected secrets in staged changes
  echo [-] Commit blocked. Review and fix before committing
  exit /b 1
)
`;
}
