export interface RawPlanDto {
  planId: string;
  name: string;
  slug: string;
  description: string;
  audience: string;
  price: number;
  interval: string;
  features: string[];
  limits?: Record<string, number>;
}

export interface GetPlansApiResponse {
  isSuccess: boolean;
  value: {
    plans: RawPlanDto[];
  };
  message: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  audience: string;
  description: string;
  price: number;
  interval: string;
  formattedPrice: string;
  billingNote: string;
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
  includedLabel: string;
  features: string[];
}

export interface UseSubscriptionPlansResult {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
