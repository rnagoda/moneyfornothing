/**
 * Zod validation schemas for Money For Nothing
 * Based on PRD data validation requirements
 */

import { z } from 'zod';

// ============================================
// Validation Constants
// ============================================

const MAX_NAME_LENGTH = 32;
const NAME_PATTERN = /^[a-zA-Z0-9\s-]+$/;

// ============================================
// Base Schemas
// ============================================

/**
 * Name validation: max 32 characters, only letters, numbers, spaces, hyphens
 */
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or less`)
  .regex(NAME_PATTERN, 'Name can only contain letters, numbers, spaces, and hyphens')
  .transform(val => val.trim());

/**
 * Amount validation: positive number, max 2 decimal places
 */
const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places')
  .max(999999999.99, 'Amount is too large');

/**
 * Non-negative amount (for savings that could be 0)
 */
const nonNegativeAmountSchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places')
  .max(999999999.99, 'Amount is too large');

// ============================================
// Income Schemas
// ============================================

export const incomeInputSchema = z.object({
  name: nameSchema,
  defaultAmount: amountSchema,
  paycheckNumber: z.union([z.literal(1), z.literal(2)]),
});

export const incomeSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  defaultAmount: amountSchema,
  currentAmount: amountSchema,
  paycheckNumber: z.union([z.literal(1), z.literal(2)]),
});

// ============================================
// Bill Schemas
// ============================================

export const billInputSchema = z.object({
  name: nameSchema,
  amount: amountSchema,
});

export const billSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  amount: amountSchema,
  paid: z.boolean(),
});

// ============================================
// Savings Schemas
// ============================================

export const savingsInputSchema = z.object({
  name: nameSchema,
  amount: nonNegativeAmountSchema,
});

export const savingsSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  amount: nonNegativeAmountSchema,
});

// ============================================
// App State Schema
// ============================================

export const appStateSchema = z.object({
  lastSessionMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
  versionString: z.string(),
  hasCompletedSetup: z.boolean(),
});

// ============================================
// Full Data Schema
// ============================================

export const appDataSchema = z.object({
  income: z.array(incomeSchema),
  bills: z.array(billSchema),
  savings: z.array(savingsSchema),
  appState: appStateSchema,
});

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type IncomeInput = z.infer<typeof incomeInputSchema>;
export type BillInput = z.infer<typeof billInputSchema>;
export type SavingsInput = z.infer<typeof savingsInputSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate income input data
 * @throws ZodError if validation fails
 */
export function validateIncomeInput(data: unknown): IncomeInput {
  return incomeInputSchema.parse(data);
}

/**
 * Validate bill input data
 * @throws ZodError if validation fails
 */
export function validateBillInput(data: unknown): BillInput {
  return billInputSchema.parse(data);
}

/**
 * Validate savings input data
 * @throws ZodError if validation fails
 */
export function validateSavingsInput(data: unknown): SavingsInput {
  return savingsInputSchema.parse(data);
}

/**
 * Safe validation that returns result instead of throwing
 */
export function safeValidateIncomeInput(data: unknown) {
  return incomeInputSchema.safeParse(data);
}

export function safeValidateBillInput(data: unknown) {
  return billInputSchema.safeParse(data);
}

export function safeValidateSavingsInput(data: unknown) {
  return savingsInputSchema.safeParse(data);
}

/**
 * Check if a name is unique in a list (case-insensitive)
 */
export function isNameUnique<T extends { name: string }>(
  name: string,
  items: T[],
  excludeId?: string
): boolean {
  const normalizedName = name.toLowerCase().trim();
  return !items.some(
    item =>
      item.name.toLowerCase().trim() === normalizedName &&
      (excludeId ? (item as T & { id?: string }).id !== excludeId : true)
  );
}

/**
 * Format validation error messages for display
 */
export function formatValidationErrors(error: z.ZodError<unknown>): string[] {
  return error.issues.map(issue => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Get first validation error message
 */
export function getFirstValidationError(error: z.ZodError<unknown>): string {
  return error.issues[0]?.message ?? 'Validation failed';
}
