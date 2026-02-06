import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/categorize-transaction', (req, res) => res.json({ message: 'AI categorization - To be implemented' }));
router.post('/extract-receipt', (req, res) => res.json({ message: 'OCR extraction - To be implemented' }));

export default router;
