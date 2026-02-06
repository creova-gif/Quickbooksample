import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => res.json({ message: 'List contacts - To be implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create contact - To be implemented' }));

export default router;
