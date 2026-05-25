import { Router } from 'express';
import { checkGitleaksInstalled, getGitleaksVersion } from '../lib/gitleaks.js';

export const gitleaksRouter = Router();

gitleaksRouter.get('/check', async (_req, res) => {
  const installed = checkGitleaksInstalled();
  const version = installed ? getGitleaksVersion() : null;
  res.json({
    installed,
    version,
    installUrl: 'https://github.com/gitleaks/gitleaks',
  });
});
