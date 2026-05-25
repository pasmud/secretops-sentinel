import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const reportRouter = Router();

reportRouter.post('/', async (req, res) => {
  try {
    const { scanRunId } = req.body as { scanRunId?: string };
    const where = scanRunId ? { scanRunId } : {};

    const findings = await prisma.finding.findMany({
      where,
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        scanRun: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const scanRun = findings[0]?.scanRun;

    const report = generateReport(findings, scanRun);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="incident-report-${new Date().toISOString().slice(0, 10)}.md"`);
    res.send(report);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

function generateReport(findings: any[], scanRun: any): string {
  const now = new Date().toISOString();
  const repoPath = scanRun?.repoPath || 'unknown';
  const total = findings.length;
  const open = findings.filter(f => !['closed', 'false_positive'].includes(f.workflowState)).length;
  const closed = findings.filter(f => f.workflowState === 'closed').length;
  const fp = findings.filter(f => f.workflowState === 'false_positive').length;

  let report = `# SecretOps Sentinel Incident Report\n\n`;
  report += `**Generated:** ${now}\n`;
  report += `**Repository:** ${repoPath}\n`;
  report += `**Total Findings:** ${total}\n`;
  report += `**Open:** ${open} | **Closed:** ${closed} | **False Positives:** ${fp}\n\n`;

  report += `## Summary\n\n`;
  report += `| Severity | Count |\n`;
  report += `|----------|-------|\n`;
  for (const s of ['critical', 'high', 'medium', 'low']) {
    const count = findings.filter(f => f.severity === s).length;
    if (count > 0) report += `| ${s} | ${count} |\n`;
  }
  report += `\n`;

  report += `## Findings\n\n`;
  report += `| Type | File | Line | Match | Severity | Status |\n`;
  report += `|------|------|------|-------|----------|--------|\n`;
  for (const f of findings) {
    report += `| ${f.secretType} | ${f.filePath} | ${f.lineNumber} | \`${f.redactedMatch}\` | ${f.severity} | ${f.workflowState} |\n`;
  }
  report += `\n`;

  report += `## Workflow Timeline\n\n`;
  for (const f of findings) {
    if (f.events && f.events.length > 0) {
      report += `### ${f.secretType} (${f.filePath}:${f.lineNumber})\n\n`;
      report += `| From | To | Note | Date |\n`;
      report += `|------|-----|------|------|\n`;
      for (const e of f.events) {
        report += `| ${e.fromState || '-'} | ${e.toState} | ${e.note || '-'} | ${new Date(e.createdAt).toISOString().slice(0, 16)} |\n`;
      }
      report += `\n`;
    }
  }

  report += `## Recommendations\n\n`;
  report += `1. Rotate all confirmed secrets immediately\n`;
  report += `2. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)\n`;
  report += `3. Set up pre-commit hooks to prevent future leaks\n`;
  report += `4. Enable CI/CD secret scanning\n`;
  report += `5. Review and update .gitignore to exclude credential files\n\n`;

  report += `## Safety Notice\n\n`;
  report += `> Only scan systems, code, APIs, and infrastructure you own or are authorized to test.\n`;

  return report;
}
