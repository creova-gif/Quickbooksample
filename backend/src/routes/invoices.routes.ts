/**
 * Invoices Routes
 */

import { Router } from 'express';
import { InvoicesController } from '../controllers/invoices.controller';
import { authMiddleware } from '../shared/middleware/auth.middleware';
import { validateRequest } from '../shared/middleware/validation.middleware';
import { createInvoiceSchema } from '../shared/validators/invoice.validators';

const router = Router();
const invoicesController = new InvoicesController();

// All invoice routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/v1/invoices
 * @desc    List all invoices for tenant
 * @access  Private
 */
router.get('/', invoicesController.listInvoices.bind(invoicesController));

/**
 * @route   POST /api/v1/invoices
 * @desc    Create new invoice
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createInvoiceSchema),
  invoicesController.createInvoice.bind(invoicesController)
);

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/:id', invoicesController.getInvoice.bind(invoicesController));

/**
 * @route   PATCH /api/v1/invoices/:id
 * @desc    Update invoice (only if draft)
 * @access  Private
 */
router.patch('/:id', invoicesController.updateInvoice.bind(invoicesController));

/**
 * @route   DELETE /api/v1/invoices/:id
 * @desc    Delete invoice (only if draft)
 * @access  Private
 */
router.delete('/:id', invoicesController.deleteInvoice.bind(invoicesController));

/**
 * @route   POST /api/v1/invoices/:id/send
 * @desc    Send invoice to customer and submit to tax authority
 * @access  Private
 */
router.post('/:id/send', invoicesController.sendInvoice.bind(invoicesController));

/**
 * @route   GET /api/v1/invoices/:id/pdf
 * @desc    Download invoice as PDF
 * @access  Private
 */
router.get('/:id/pdf', invoicesController.downloadPDF.bind(invoicesController));

/**
 * @route   POST /api/v1/invoices/:id/mark-paid
 * @desc    Mark invoice as paid
 * @access  Private
 */
router.post('/:id/mark-paid', invoicesController.markPaid.bind(invoicesController));

/**
 * @route   POST /api/v1/invoices/:id/void
 * @desc    Void invoice
 * @access  Private
 */
router.post('/:id/void', invoicesController.voidInvoice.bind(invoicesController));

export default router;
