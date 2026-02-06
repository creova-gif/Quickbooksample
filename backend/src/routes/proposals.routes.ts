/**
 * Proposals Routes
 * Customer proposal requests and admin management
 */

import { Router } from 'express';
import { randomUUID } from 'crypto'; // Use Node's built-in crypto instead of uuid package

const router = Router();

// In-memory storage (replace with database in production)
let proposals: any[] = [];

/**
 * POST /api/v1/proposals
 * Submit a proposal request (customer-facing)
 */
router.post('/', async (req, res) => {
  try {
    const proposalData = req.body;

    const proposal = {
      id: randomUUID(), // Use crypto.randomUUID() instead
      ...proposalData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    proposals.push(proposal);

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to customer

    res.status(201).json({
      success: true,
      proposal,
      message: 'Proposal submitted successfully',
    });
  } catch (error: any) {
    console.error('Proposal submission error:', error);
    res.status(500).json({
      error: 'Failed to submit proposal',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/proposals
 * Get all proposals (admin only)
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Add authentication check for admin users
    
    // Sort by created_at descending (newest first)
    const sortedProposals = [...proposals].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json(sortedProposals);
  } catch (error: any) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      error: 'Failed to get proposals',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/proposals/:id
 * Get single proposal by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = proposals.find(p => p.id === id);

    if (!proposal) {
      return res.status(404).json({
        error: 'Proposal not found',
      });
    }

    res.json(proposal);
  } catch (error: any) {
    console.error('Get proposal error:', error);
    res.status(500).json({
      error: 'Failed to get proposal',
      message: error.message,
    });
  }
});

/**
 * PATCH /api/v1/proposals/:id/status
 * Update proposal status (approve/reject)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const proposalIndex = proposals.findIndex(p => p.id === id);
    if (proposalIndex === -1) {
      return res.status(404).json({
        error: 'Proposal not found',
      });
    }

    proposals[proposalIndex] = {
      ...proposals[proposalIndex],
      status,
      updated_at: new Date().toISOString(),
    };

    // TODO: Send notification email to customer

    res.json({
      success: true,
      proposal: proposals[proposalIndex],
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: 'Failed to update status',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/proposals/:id/invoice
 * Generate invoice from approved proposal
 */
router.post('/:id/invoice', async (req, res) => {
  try {
    const { id } = req.params;
    const { proposal } = req.body;

    const proposalData = proposal || proposals.find(p => p.id === id);
    if (!proposalData) {
      return res.status(404).json({
        error: 'Proposal not found',
      });
    }

    // Generate recommendation if not exists
    let recommendation = proposalData.recommendation;
    if (!recommendation) {
      const { salesConfiguratorService } = await import(
        '../services/salesConfigurator.service'
      );

      recommendation = await salesConfiguratorService.generate({
        company_size: proposalData.company_size,
        industry: proposalData.industry,
        countries: proposalData.countries,
        offline_required: proposalData.needs_offline,
        modules_needed: proposalData.modules_needed,
        data_volume: 'medium',
        deployment_preference: 'undecided',
      });
    }

    // Create invoice
    const invoice = {
      id: randomUUID(), // Fixed: use randomUUID instead of uuidv4
      proposal_id: proposalData.id,
      invoice_number: `INV-${Date.now()}`,
      customer: {
        name: proposalData.company_name,
        contact: proposalData.contact_name,
        email: proposalData.email,
        phone: proposalData.phone,
      },
      items: [
        {
          description: `${recommendation.license_tier} Plan - ${recommendation.recommended_deployment} Deployment`,
          quantity: 1,
          unit_price: recommendation.pricing.license_fee,
          total: recommendation.pricing.license_fee,
        },
        {
          description: 'Setup & Implementation',
          quantity: 1,
          unit_price: recommendation.pricing.setup_fee,
          total: recommendation.pricing.setup_fee,
        },
      ],
      subtotal: recommendation.pricing.total_first_year,
      tax: 0,
      total: recommendation.pricing.total_first_year,
      status: 'draft',
      billing_frequency: recommendation.pricing.billing_frequency,
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    // Update proposal status
    const proposalIndex = proposals.findIndex(p => p.id === id);
    if (proposalIndex !== -1) {
      proposals[proposalIndex] = {
        ...proposals[proposalIndex],
        status: 'invoiced',
        recommendation,
        invoice_id: invoice.id,
        updated_at: new Date().toISOString(),
      };
    }

    // TODO: Save invoice to database
    // TODO: Send invoice email to customer

    res.json({
      success: true,
      invoice,
      proposal: proposals[proposalIndex],
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      error: 'Failed to generate invoice',
      message: error.message,
    });
  }
});

export default router;