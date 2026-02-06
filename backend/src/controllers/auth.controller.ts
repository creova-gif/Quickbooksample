/**
 * Authentication Controller
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../db';
import { logger } from '../shared/utils/logger';
import { AppError } from '../shared/utils/app-error';
import { CountryService } from '../shared/services/country.service';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  countryCode: string;
  phone?: string;
  taxId?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  /**
   * Register a new business and owner user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        businessName,
        countryCode,
        phone,
        taxId,
      }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('User with this email already exists', 409);
      }

      // Get country configuration
      const countryConfig = CountryService.getCountryConfig(countryCode);
      if (!countryConfig) {
        throw new AppError('Invalid country code', 400);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create tenant and user in transaction
      const result = await transaction(async (client) => {
        // 1. Create tenant (business)
        const tenantResult = await client.query(
          `INSERT INTO tenants (
            name, country_code, currency, vat_rate, timezone
          ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [
            businessName,
            countryCode,
            countryConfig.currency,
            countryConfig.vatRate,
            countryConfig.timezone,
          ]
        );
        const tenantId = tenantResult.rows[0].id;

        // 2. Update tenant with tax ID if provided
        if (taxId) {
          await client.query(
            'UPDATE tenants SET tax_id = $1 WHERE id = $2',
            [taxId, tenantId]
          );
        }

        // 3. Create owner user
        const userResult = await client.query(
          `INSERT INTO users (
            tenant_id, email, password_hash, first_name, last_name, 
            phone, role, email_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, 'owner', false) RETURNING id, email, first_name, last_name, role`,
          [tenantId, email, passwordHash, firstName, lastName, phone]
        );
        const user = userResult.rows[0];

        // 4. Initialize default chart of accounts
        await this.initializeDefaultAccounts(client, tenantId, countryCode);

        // 5. Initialize default categories
        await this.initializeDefaultCategories(client, tenantId);

        return { tenantId, user };
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(result.user.id, result.tenantId);
      const refreshToken = this.generateRefreshToken(result.user.id);

      // Store refresh token (in production, use Redis)
      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [result.user.id, await bcrypt.hash(refreshToken, 10)]
      );

      logger.info(`New user registered: ${email}, tenant: ${result.tenantId}`);

      res.status(201).json({
        user: result.user,
        tenant: {
          id: result.tenantId,
          name: businessName,
          countryCode,
          currency: countryConfig.currency,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Get user with tenant info
      const result = await query(
        `SELECT 
          u.id, u.tenant_id, u.email, u.password_hash, u.first_name, u.last_name, 
          u.role, u.email_verified, t.name as business_name, t.country_code
         FROM users u
         JOIN tenants t ON u.tenant_id = t.id
         WHERE u.email = $1 AND u.deleted_at IS NULL`,
        [email]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if email is verified (optional, can be enforced)
      // if (!user.email_verified) {
      //   throw new AppError('Please verify your email first', 403);
      // }

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id, user.tenant_id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token
      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, await bcrypt.hash(refreshToken, 10)]
      );

      // Update last login
      await query(
        `UPDATE users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2`,
        [req.ip, user.id]
      );

      logger.info(`User logged in: ${email}`);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        tenant: {
          id: user.tenant_id,
          name: user.business_name,
          countryCode: user.country_code,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      );

      // Check if token exists in database and is not revoked
      const result = await query(
        `SELECT rt.id, rt.user_id, u.tenant_id
         FROM refresh_tokens rt
         JOIN users u ON rt.user_id = u.id
         WHERE rt.user_id = $1 
         AND rt.revoked_at IS NULL 
         AND rt.expires_at > NOW()`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokenData = result.rows[0];

      // Generate new access token
      const newAccessToken = this.generateAccessToken(
        tokenData.user_id,
        tokenData.tenant_id
      );

      res.json({
        accessToken: newAccessToken,
        expiresIn: 900,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        const decoded: any = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET!
        );

        // Revoke refresh token
        await query(
          'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1',
          [decoded.userId]
        );
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // TODO: Implement password reset logic
      // 1. Generate reset token
      // 2. Store in database with expiry
      // 3. Send email with reset link

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      // TODO: Implement password reset logic
      // 1. Verify reset token
      // 2. Hash new password
      // 3. Update user password
      // 4. Invalidate reset token

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      // TODO: Implement email verification logic
      // 1. Verify email token
      // 2. Update user email_verified = true

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Generate JWT access token
   */
  private generateAccessToken(userId: string, tenantId: string): string {
    return jwt.sign(
      { userId, tenantId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Generate JWT refresh token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Initialize default chart of accounts for new tenant
   */
  private async initializeDefaultAccounts(
    client: any,
    tenantId: string,
    countryCode: string
  ) {
    const defaultAccounts = [
      // Assets
      { code: '1000', name: 'Cash', type: 'asset', subtype: 'current_asset' },
      { code: '1100', name: 'Bank Account', type: 'asset', subtype: 'current_asset' },
      { code: '1200', name: 'Accounts Receivable', type: 'asset', subtype: 'current_asset' },
      { code: '1500', name: 'Fixed Assets', type: 'asset', subtype: 'fixed_asset' },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'current_liability' },
      { code: '2100', name: 'VAT Payable', type: 'liability', subtype: 'current_liability' },
      { code: '2200', name: 'VAT Recoverable', type: 'asset', subtype: 'current_asset' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', type: 'equity', subtype: 'capital' },
      { code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings' },
      
      // Revenue
      { code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'operating_revenue' },
      { code: '4100', name: 'Service Revenue', type: 'revenue', subtype: 'operating_revenue' },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'cogs' },
      { code: '6000', name: 'Salaries & Wages', type: 'expense', subtype: 'operating_expense' },
      { code: '6100', name: 'Rent', type: 'expense', subtype: 'operating_expense' },
      { code: '6200', name: 'Utilities', type: 'expense', subtype: 'operating_expense' },
      { code: '6300', name: 'Marketing', type: 'expense', subtype: 'operating_expense' },
      { code: '6400', name: 'Office Supplies', type: 'expense', subtype: 'operating_expense' },
      { code: '6500', name: 'Transportation', type: 'expense', subtype: 'operating_expense' },
    ];

    for (const account of defaultAccounts) {
      await client.query(
        `INSERT INTO accounts (tenant_id, code, name, type, subtype, is_system, is_active)
         VALUES ($1, $2, $3, $4, $5, true, true)`,
        [tenantId, account.code, account.name, account.type, account.subtype]
      );
    }
  }

  /**
   * Initialize default categories for new tenant
   */
  private async initializeDefaultCategories(client: any, tenantId: string) {
    const defaultCategories = [
      // Income categories
      { name: 'Sales', type: 'income', color: '#10b981' },
      { name: 'Services', type: 'income', color: '#3b82f6' },
      
      // Expense categories
      { name: 'Rent & Lease', type: 'expense', color: '#ef4444' },
      { name: 'Salaries', type: 'expense', color: '#f59e0b' },
      { name: 'Utilities', type: 'expense', color: '#8b5cf6' },
      { name: 'Marketing', type: 'expense', color: '#ec4899' },
      { name: 'Office Supplies', type: 'expense', color: '#06b6d4' },
      { name: 'Transportation', type: 'expense', color: '#84cc16' },
      { name: 'Internet & Phone', type: 'expense', color: '#6366f1' },
      { name: 'Professional Services', type: 'expense', color: '#f43f5e' },
    ];

    for (const category of defaultCategories) {
      await client.query(
        `INSERT INTO categories (tenant_id, name, type, color, is_system, is_active)
         VALUES ($1, $2, $3, $4, true, true)`,
        [tenantId, category.name, category.type, category.color]
      );
    }
  }
}
