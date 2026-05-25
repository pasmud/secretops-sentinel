import { Router } from 'express';
import { getRotationChecklist, getAllRotationTypes } from '../lib/rotation.js';

export const rotationRouter = Router();

rotationRouter.get('/types', async (_req, res) => {
  res.json({ types: getAllRotationTypes() });
});

rotationRouter.get('/:secretType', async (req, res) => {
  const checklist = getRotationChecklist(req.params.secretType);
  if (!checklist) {
    res.status(404).json({ error: `No checklist for secret type: ${req.params.secretType}` });
    return;
  }
  res.json({ checklist });
});
