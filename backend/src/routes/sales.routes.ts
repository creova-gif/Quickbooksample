/**
 * Sales Configuration Routes
 * AI-powered sales engineering endpoints
 */

import { Router } from 'express';
import { salesConfiguratorService } from '../services/salesConfigurator.service';

const router = Router();

/**
 * POST /api/v1/sales/configure
 * Generate sales configuration and pricing recommendation
 */
router.post('/configure', async (req, res) => {
  try {
    const profile = req.body;

    // Validate required fields
    if (!profile.company_size || !profile.industry || !profile.countries?.length) {
      return res.status(400).json({
        error: 'Missing required fields: company_size, industry, countries'
      });
    }
    
    // Generate recommendation
    const recommendation = await salesConfiguratorService.generate(profile);

    res.json(recommendation);

  } catch (error: any) {
    console.error('Sales configuration error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendation',
      message: error.message
    });
  }
});

export default router;