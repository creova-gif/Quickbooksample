/**
 * EA Accounting Platform - Backend API
 * Express server with TypeScript
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version endpoint
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    name: 'EA Accounting Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transactions: '/api/v1/transactions',
      invoices: '/api/v1/invoices',
      payroll: '/api/v1/payroll',
      inventory: '/api/v1/inventory',
      branches: '/api/v1/branches',
      license: '/api/v1/license',
      taxSync: '/api/v1/tax-sync',
      audit: '/api/v1/audit'
    }
  });
});

// Routes (will be added)
// import transactionRoutes from './routes/transactions';
// import invoiceRoutes from './routes/invoices';
// app.use('/api/v1/transactions', transactionRoutes);
// app.use('/api/v1/invoices', invoiceRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('EA Accounting Platform - Backend API');
  console.log('='.repeat(50));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API info: http://localhost:${PORT}/api/v1`);
  console.log('='.repeat(50));
});

export default app;
