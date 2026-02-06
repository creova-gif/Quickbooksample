import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => res.json({ message: 'List accounts - To be implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create account - To be implemented' }));

export default router;
