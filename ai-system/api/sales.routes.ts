/**
 * Sales Configuration Routes
 */

import { Router } from 'express';
import { configureSales, generateProposal, emailProposal } from './sales.controller';

const router = Router();

/**
 * POST /api/sales/configure
 * Generate sales configuration and pricing recommendation
 */
router.post('/configure', configureSales);

/**
 * POST /api/sales/proposal
 * Generate proposal PDF
 */
router.post('/proposal', generateProposal);

/**
 * POST /api/sales/email
 * Email proposal to client
 */
router.post('/email', emailProposal);

export default router;
