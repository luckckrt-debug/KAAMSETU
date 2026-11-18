// KAAMSETU - Commission Engine & Fee Calculation Architecture
// Supports platform-wide, profession-wise, service-wise, and worker exemptions.

import { CommissionRule } from './types';

export interface CommissionBreakdown {
  jobAmount: number;
  commissionRatePercent: number;
  commissionAmount: number;
  additionalFees: number;
  workerNetEarning: number;
  isExempt: boolean;
  ruleApplied: string;
}

/**
 * Calculates platform commission and worker net earning with full transparency.
 * workerNetEarning = eligibleJobAmount - platformCommission - applicableFees
 */
export function calculateJobCommission(params: {
  jobAmount: number;
  professionSlug?: string;
  serviceCategory?: string;
  workerProfileId?: string;
  isCash?: boolean;
  customRules?: CommissionRule[];
}): CommissionBreakdown {
  const { jobAmount, professionSlug, serviceCategory, workerProfileId, isCash, customRules = [] } = params;

  if (jobAmount <= 0) {
    return {
      jobAmount: 0,
      commissionRatePercent: 0,
      commissionAmount: 0,
      additionalFees: 0,
      workerNetEarning: 0,
      isExempt: false,
      ruleApplied: 'Zero Amount',
    };
  }

  // 1. Check for worker exemption in custom rules
  const activeRules = customRules.filter(r => r.isActive);
  const exemptRule = activeRules.find(r => workerProfileId && r.exemptWorkerProfileIds?.includes(workerProfileId));
  if (exemptRule) {
    return {
      jobAmount,
      commissionRatePercent: 0,
      commissionAmount: 0,
      additionalFees: 0,
      workerNetEarning: jobAmount,
      isExempt: true,
      ruleApplied: `Worker Exemption: ${exemptRule.name}`,
    };
  }

  // 2. Check for profession / service specific rule
  let matchedRule: CommissionRule | undefined;
  if (professionSlug) {
    matchedRule = activeRules.find(r => r.professionSlug?.toLowerCase() === professionSlug.toLowerCase());
  }
  if (!matchedRule && serviceCategory) {
    matchedRule = activeRules.find(r => r.serviceCategory?.toLowerCase() === serviceCategory.toLowerCase());
  }

  let ratePercent = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 10.0);
  let ruleName = `Standard Platform Rate (${ratePercent}%)`;
  let fixedFee = 0;

  if (matchedRule) {
    if (matchedRule.commissionType === 'PERCENTAGE') {
      ratePercent = matchedRule.percentageRate;
      ruleName = `${matchedRule.name} (${ratePercent}%)`;
    } else if (matchedRule.commissionType === 'FIXED') {
      ratePercent = 0;
      fixedFee = matchedRule.fixedAmount || 50;
      ruleName = `${matchedRule.name} (Fixed ₹${fixedFee})`;
    } else if (matchedRule.commissionType === 'HYBRID') {
      ratePercent = matchedRule.percentageRate;
      fixedFee = matchedRule.fixedAmount || 0;
      ruleName = `${matchedRule.name} (${ratePercent}% + ₹${fixedFee})`;
    }
  }

  // Compute commission rounded to 2 decimal places / nearest rupee
  const percentageCommission = Math.round(((jobAmount * ratePercent) / 100) * 100) / 100;
  const totalCommission = Math.min(jobAmount, Math.round((percentageCommission + fixedFee) * 100) / 100);
  const workerNet = Math.max(0, Math.round((jobAmount - totalCommission) * 100) / 100);

  return {
    jobAmount,
    commissionRatePercent: ratePercent,
    commissionAmount: totalCommission,
    additionalFees: 0,
    workerNetEarning: workerNet,
    isExempt: false,
    ruleApplied: ruleName,
  };
}
