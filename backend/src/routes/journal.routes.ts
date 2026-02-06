import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => res.json({ message: 'List journal entries - To be implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create journal entry - To be implemented' }));

export default router;
