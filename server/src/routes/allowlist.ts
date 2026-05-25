import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const allowlistRouter = Router();

allowlistRouter.get('/', async (_req, res) => {
  try {
    const suggestions = await prisma.allowlistSuggestion.findMany({
      include: { finding: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ suggestions });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

allowlistRouter.patch('/:id/accept', async (req, res) => {
  try {
    const suggestion = await prisma.allowlistSuggestion.update({
      where: { id: req.params.id },
      data: { accepted: true },
    });
    res.json({ suggestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

allowlistRouter.get('/export', async (_req, res) => {
  try {
    const suggestions = await prisma.allowlistSuggestion.findMany({
      where: { accepted: true },
    });

    let toml = '# SecretOps Sentinel Generated Allowlist\n';
    toml += '# Review carefully before using\n\n';
    toml += '[allowlist]\n';

    const pathEntries = suggestions.filter(s => s.suggestionType === 'path');
    if (pathEntries.length > 0) {
      toml += 'paths = [\n';
      for (const s of pathEntries) {
        toml += `  '''${s.allowlistValue}''',\n`;
      }
      toml += ']\n\n';
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=".gitleaks.toml"');
    res.send(toml);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});
