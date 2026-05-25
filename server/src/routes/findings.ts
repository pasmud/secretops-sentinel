import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { isValidTransition } from '../lib/workflow.js';
import { getRotationChecklist } from '../lib/rotation.js';

export const findingsRouter = Router();

findingsRouter.get('/', async (req, res) => {
  try {
    const { scanRunId, status, secretType, severity } = req.query as Record<string, string | undefined>;
    const where: any = {};
    if (scanRunId) where.scanRunId = scanRunId;
    if (status) where.workflowState = status;
    if (secretType) where.secretType = secretType;
    if (severity) where.severity = severity;

    const findings = await prisma.finding.findMany({
      where,
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        allowlistSuggestion: true,
        rotationChecklist: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ findings });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

findingsRouter.get('/:id', async (req, res) => {
  try {
    const finding = await prisma.finding.findUnique({
      where: { id: req.params.id },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        allowlistSuggestion: true,
        rotationChecklist: true,
      },
    });
    if (!finding) {
      res.status(404).json({ error: 'Finding not found' });
      return;
    }
    res.json({ finding });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

findingsRouter.patch('/:id', async (req, res) => {
  try {
    const { workflowState, note } = req.body as { workflowState?: string; note?: string };
    const finding = await prisma.finding.findUnique({ where: { id: req.params.id } });
    if (!finding) {
      res.status(404).json({ error: 'Finding not found' });
      return;
    }

    if (workflowState) {
      if (!isValidTransition(finding.workflowState, workflowState)) {
        res.status(400).json({
          error: `Invalid transition from ${finding.workflowState} to ${workflowState}`,
        });
        return;
      }

      await prisma.workflowEvent.create({
        data: {
          findingId: finding.id,
          fromState: finding.workflowState,
          toState: workflowState,
          note: note || null,
        },
      });

      const updated = await prisma.finding.update({
        where: { id: finding.id },
        data: { workflowState },
        include: {
          events: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (workflowState === 'revoked' || workflowState === 'rotated') {
        const existingChecklist = await prisma.rotationChecklist.findUnique({
          where: { findingId: finding.id },
        });
        if (!existingChecklist) {
          const checklist = getRotationChecklist(finding.ruleId);
          if (checklist) {
            await prisma.rotationChecklist.create({
              data: {
                findingId: finding.id,
                secretType: checklist.secretType,
                steps: JSON.stringify(checklist.steps),
              },
            });
          }
        }
      }

      if (workflowState === 'false_positive') {
        await prisma.allowlistSuggestion.create({
          data: {
            findingId: finding.id,
            ruleId: finding.ruleId,
            matchValue: finding.redactedMatch,
            suggestionType: 'path',
            allowlistValue: finding.filePath,
            rationale: `Marked as false positive by user`,
          },
        });
      }

      res.json({ finding: updated });
      return;
    }

    res.json({ finding });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

findingsRouter.get('/states/available', async (_req, res) => {
  res.json({
    states: ['detected', 'confirmed', 'revoked', 'rotated', 'history_cleaned', 'closed', 'false_positive'],
  });
});
