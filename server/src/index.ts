import express from 'express';
import cors from 'cors';
import { scanRouter } from './routes/scan.js';
import { findingsRouter } from './routes/findings.js';
import { allowlistRouter } from './routes/allowlist.js';
import { rotationRouter } from './routes/rotation.js';
import { reportRouter } from './routes/report.js';
import { precommitRouter } from './routes/precommit.js';
import { gitleaksRouter } from './routes/gitleaks.js';

const app = express();
const PORT = parseInt(process.env.PORT || '42001', 10);

app.use(cors());
app.use(express.json());

app.use('/api/scan', scanRouter);
app.use('/api/findings', findingsRouter);
app.use('/api/allowlist', allowlistRouter);
app.use('/api/rotation', rotationRouter);
app.use('/api/report', reportRouter);
app.use('/api/precommit', precommitRouter);
app.use('/api/gitleaks', gitleaksRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`SecretOps Sentinel API running on port ${PORT}`);
});

export { app };
