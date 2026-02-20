import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(3, 'Password must be at least 3 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Vendor validation
export const vendorSchema = z.object({
  name: z
    .string()
    .min(1, 'Vendor name is required')
    .min(2, 'Vendor name must be at least 2 characters')
    .max(255, 'Vendor name must be less than 255 characters')
    .trim(),
  upi_id: z
    .string()
    .max(255, 'UPI ID must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  bank_account: z
    .string()
    .max(255, 'Bank account must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  ifsc: z
    .string()
    .max(100, 'IFSC must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// Payout validation
export const payoutSchema = z.object({
  vendor_id: z
    .string()
    .min(1, 'Please select a vendor'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => {
        // Skip validation if empty (handled by min(1))
        if (!val || val.trim() === '') return true;
        
        // Check if it's a valid number greater than 0
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Amount must be greater than 0' }
    )
    .refine(
      (val) => {
        // Skip size check if empty or invalid (handled by previous checks)
        if (!val || val.trim() === '') return true;
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) return true;
        return num <= 999999999999.99;
      },
      { message: 'Amount is too large' }
    ),
  mode: z.enum(['UPI', 'IMPS', 'NEFT'], {
    required_error: 'Please select a payment mode',
  }),
  note: z
    .string()
    .max(500, 'Note must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type PayoutFormData = z.infer<typeof payoutSchema>;

// Reject payout validation
export const rejectPayoutSchema = z.object({
  decision_reason: z
    .string()
    .min(1, 'Rejection reason is required')
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(500, 'Rejection reason must be less than 500 characters')
    .trim(),
});

export type RejectPayoutFormData = z.infer<typeof rejectPayoutSchema>;
