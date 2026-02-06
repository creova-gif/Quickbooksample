/**
 * Transactions Routes
 */

import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';
import { authMiddleware } from '../shared/middleware/auth.middleware';

const router = Router();
const transactionsController = new TransactionsController();

// All transaction routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/v1/transactions
 * @desc    List all transactions for tenant
 * @access  Private
 */
router.get('/', transactionsController.listTransactions.bind(transactionsController));

/**
 * @route   POST /api/v1/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post('/', transactionsController.createTransaction.bind(transactionsController));

/**
 * @route   GET /api/v1/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', transactionsController.getTransaction.bind(transactionsController));

/**
 * @route   PATCH /api/v1/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.patch('/:id', transactionsController.updateTransaction.bind(transactionsController));

/**
 * @route   DELETE /api/v1/transactions/:id
 * @desc    Delete transaction
 * @access  Private
 */
router.delete('/:id', transactionsController.deleteTransaction.bind(transactionsController));

/**
 * @route   POST /api/v1/transactions/:id/categorize
 * @desc    Update transaction category
 * @access  Private
 */
router.post('/:id/categorize', transactionsController.categorize.bind(transactionsController));

export default router;
