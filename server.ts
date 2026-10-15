import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

import { initDatabase } from './server/db.js';
import authRouter from './server/routes/auth.js';
import staffRouter from './server/routes/staff.js';
import patientsRouter from './server/routes/patients.js';
import visitsRouter from './server/routes/visits.js';
import appointmentsRouter from './server/routes/appointments.js';
import nursingRouter from './server/routes/nursing.js';
import consultationsRouter from './server/routes/consultations.js';
import prescriptionsRouter from './server/routes/prescriptions.js';
import pharmacyRouter from './server/routes/pharmacy.js';
import laboratoryRouter from './server/routes/laboratory.js';
import billingRouter from './server/routes/billing.js';
import reportsRouter from './server/routes/reports.js';
import settingsRouter from './server/routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize relational SQLite database schema, tables, and seeds
initDatabase();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/staff', staffRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/nursing', nursingRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/laboratory', laboratoryRouter);
app.use('/api/billing', billingRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Front-end Vite Dev Integration or Production Static Assets
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AL-EMAN CLINIC AND MATERNITY HOME active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
