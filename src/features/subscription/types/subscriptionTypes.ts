export type BillingCycle = "monthly" | "yearly";

export interface SubscriptionPlan {
  id: string;
  name: string;
  audience: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyBillingNote: string;
  monthlyBillingNote: string;
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
  includedLabel: string;
  features: string[];
  limits: string[];
}
