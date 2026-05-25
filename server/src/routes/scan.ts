import { Router } from 'express';
import { existsSync } from 'fs';
import { prisma } from '../lib/prisma.js';
import { checkGitleaksInstalled, runGitleaksScan } from '../lib/gitleaks.js';
import { getDemoFindings } from '../lib/demo.js';
import { redactSecret, truncateCommit } from '../lib/redact.js';

export const scanRouter = Router();

scanRouter.post('/', async (req, res) => {
  try {
    const { repoPath, useDemo } = req.body as { repoPath?: string; useDemo?: boolean };

    if (!repoPath && !useDemo) {
      res.status(400).json({ error: 'repoPath is required' });
      return;
    }

    if (repoPath && !existsSync(repoPath)) {
      res.status(400).json({ error: `Path does not exist: ${repoPath}` });
      return;
    }

    const scanRun = await prisma.scanRun.create({
      data: {
        repoPath: repoPath || 'demo-fixture',
        gitleaksUsed: false,
        status: 'running',
      },
    });

    let rawFindings: Array<{
      RuleID: string;
      Description: string;
      File: string;
      Line: number;
      Commit: string;
      Secret: string;
      Severity: string;
      Author?: string;
      Email?: string;
      Date?: string;
    }> = [];

    if (useDemo) {
      const demo = getDemoFindings();
      rawFindings = demo.findings;
    } else if (repoPath) {
      const gitleaksAvailable = checkGitleaksInstalled();
      if (gitleaksAvailable) {
        const result = runGitleaksScan(repoPath);
        if (result.error) {
          await prisma.scanRun.update({
            where: { id: scanRun.id },
            data: { status: 'failed', errorMessage: result.error, completedAt: new Date() },
          });
          res.status(500).json({ error: result.error });
          return;
        }
        rawFindings = result.findings;
      } else {
        res.status(400).json({
          error: 'Gitleaks is not installed. Install it from https://github.com/gitleaks/gitleaks or use demo mode.',
          gitleaksMissing: true,
        });
        await prisma.scanRun.update({
          where: { id: scanRun.id },
          data: { status: 'failed', errorMessage: 'Gitleaks not installed', completedAt: new Date() },
        });
        return;
      }
    }

    const findings = [];
    for (const rf of rawFindings) {
      const finding = await prisma.finding.create({
        data: {
          scanRunId: scanRun.id,
          ruleId: rf.RuleID,
          secretType: rf.Description,
          filePath: rf.File,
          lineNumber: rf.Line,
          commitSHA: truncateCommit(rf.Commit),
          redactedMatch: redactSecret(rf.Secret),
          severity: mapSeverity(rf.Severity),
          confidence: 'medium',
          authorName: (rf as any).Author || null,
          authorEmail: (rf as any).Email || null,
          date: (rf as any).Date ? new Date((rf as any).Date) : null,
          workflowState: 'detected',
        },
      });
      findings.push(finding);
    }

    await prisma.scanRun.update({
      where: { id: scanRun.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalFindings: findings.length,
        gitleaksUsed: !useDemo,
      },
    });

    res.json({ scanRunId: scanRun.id, totalFindings: findings.length, findings });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

function mapSeverity(s: string): string {
  const lower = (s || '').toLowerCase();
  if (['critical', 'high', 'medium', 'low'].includes(lower)) return lower;
  return 'medium';
}
