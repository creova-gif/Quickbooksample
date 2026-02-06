/**
 * Sales Configuration API Route
 * POST /api/sales/configure
 */

import { Request, Response, NextFunction } from 'express';
import { salesConfiguratorService } from '../../services/salesConfiguratorService';

export async function configureSales(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const clientProfile = req.body;

    // Validate required fields
    if (!clientProfile.company_size) {
      return res.status(400).json({
        error: 'company_size is required'
      });
    }

    if (!clientProfile.industry) {
      return res.status(400).json({
        error: 'industry is required'
      });
    }

    if (!clientProfile.countries || clientProfile.countries.length === 0) {
      return res.status(400).json({
        error: 'At least one country is required'
      });
    }

    // Generate recommendation
    const recommendation = await salesConfiguratorService.generate(clientProfile);

    res.json(recommendation);

  } catch (error) {
    console.error('Sales configuration error:', error);
    next(error);
  }
}

/**
 * Generate Proposal PDF
 * POST /api/sales/proposal
 */
export async function generateProposal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { recommendation, clientInfo } = req.body;

    // TODO: Generate PDF using proposal template
    // This would use a PDF library like pdfkit or puppeteer

    res.json({
      message: 'Proposal generation coming soon',
      recommendation
    });

  } catch (error) {
    console.error('Proposal generation error:', error);
    next(error);
  }
}

/**
 * Email Proposal
 * POST /api/sales/email
 */
export async function emailProposal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { recommendation, clientEmail } = req.body;

    // TODO: Send email with proposal
    // This would use an email service like SendGrid or AWS SES

    res.json({
      message: 'Email sending coming soon',
      recipient: clientEmail
    });

  } catch (error) {
    console.error('Email sending error:', error);
    next(error);
  }
}
