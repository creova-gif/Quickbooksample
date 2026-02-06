import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => res.json({ message: 'Get business - To be implemented' }));
router.patch('/', (req, res) => res.json({ message: 'Update business - To be implemented' }));

export default router;
