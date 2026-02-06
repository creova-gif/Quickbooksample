import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/profit-loss', (req, res) => res.json({ message: 'P&L report - To be implemented' }));
router.get('/balance-sheet', (req, res) => res.json({ message: 'Balance sheet - To be implemented' }));
router.get('/cash-flow', (req, res) => res.json({ message: 'Cash flow - To be implemented' }));

export default router;
