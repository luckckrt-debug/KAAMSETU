// DIGIWORK - Earning Calculation Engine & Pricing Architecture
// Model:
// Worker Agreed Wage = 100% Worker Earning (No silent deductions from worker!)
// DigiWork Platform Fee = ₹99 (Paid by customer as convenience & dispatch fee)
// Customer Total Payment = Worker Agreed Wage + ₹99

import { CommissionRule } from './types';

export interface JobPricingBreakdown {
  workerAgreedCharge: number;
  platformFee: number; // ₹99
  totalCustomerPrice: number; // workerAgreedCharge + 99
  workerNetEarning: number; // Exactly equals workerAgreedCharge
  ruleApplied: string;
}

export interface CommissionBreakdown {
  jobAmount: number;
  commissionRatePercent: number;
  commissionAmount: number;
  additionalFees: number; // ₹99 DigiWork platform fee
  workerNetEarning: number; // 100% to worker
  isExempt: boolean;
  ruleApplied: string;
}

export const DIGIWORK_PLATFORM_FEE = 99;
export const KAAMSETU_PLATFORM_FEE = DIGIWORK_PLATFORM_FEE; // Backward compatibility alias

/**
 * Standard DigiWork Marketplace Pricing Calculator:
 * Worker receives 100% of their agreed charge. Customer pays workerCharge + ₹99.
 */
export function calculateJobPricing(workerCharge: number): JobPricingBreakdown {
  const charge = Math.max(0, Math.round(Number(workerCharge) || 0));
  const platformFee = DIGIWORK_PLATFORM_FEE;
  return {
    workerAgreedCharge: charge,
    platformFee,
    totalCustomerPrice: charge + platformFee,
    workerNetEarning: charge,
    ruleApplied: `DigiWork Fair Pricing (100% Worker Earning + ₹${platformFee} Platform Fee)`,
  };
}

/**
 * Calculates platform commission and worker net earning with full transparency.
 * Under DigiWork policy, worker retains 100% of agreed wage; platform fee (₹99) is billed to customer.
 */
export function calculateJobCommission(params: {
  jobAmount: number;
  professionSlug?: string;
  serviceCategory?: string;
  workerProfileId?: string;
  isCash?: boolean;
  customRules?: CommissionRule[];
}): CommissionBreakdown {
  const { jobAmount } = params;

  if (jobAmount <= 0) {
    return {
      jobAmount: 0,
      commissionRatePercent: 0,
      commissionAmount: 0,
      additionalFees: DIGIWORK_PLATFORM_FEE,
      workerNetEarning: 0,
      isExempt: false,
      ruleApplied: 'Zero Amount',
    };
  }

  // 100% of agreed wage belongs to the worker
  const workerNet = Math.round(jobAmount * 100) / 100;

  return {
    jobAmount,
    commissionRatePercent: 0,
    commissionAmount: 0,
    additionalFees: DIGIWORK_PLATFORM_FEE,
    workerNetEarning: workerNet,
    isExempt: true,
    ruleApplied: 'DigiWork Fair Wage Guarantee (100% to Worker)',
  };
}
