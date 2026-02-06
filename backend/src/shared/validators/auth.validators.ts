/**
 * Authentication Validation Schemas
 */

import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    businessName: z.string().min(1, 'Business name is required'),
    countryCode: z.enum(['KE', 'TZ', 'UG', 'RW', 'BI'], {
      errorMap: () => ({ message: 'Invalid country code' }),
    }),
    phone: z.string().optional(),
    taxId: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
