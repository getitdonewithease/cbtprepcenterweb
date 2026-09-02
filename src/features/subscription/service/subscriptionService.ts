import { subscriptionApi } from "../api/subscriptionApi";
import type { RawPlanDto, SubscriptionPlan } from "../types/subscriptionTypes";

const formatPlanPrice = (price: number): string => {
  if (price === 0) {
    return "₦0";
  }
  return `₦${price.toLocaleString()}`;
};

const getPlanBadge = (slug: string, index: number): string | undefined => {
  const normalizedSlug = slug?.toLowerCase() ?? "";
  if (normalizedSlug === "scholar" || index === 1) {
    return "Best value";
  }
  if (normalizedSlug === "fellowship" || index === 2) {
    return "Top tier";
  }
  return undefined;
};

const transformPlanDtoToDomain = (
  rawPlan: RawPlanDto,
  index: number,
  allPlans: RawPlanDto[],
): SubscriptionPlan => {
  const isFirstPlan = index === 0;
  const previousPlan = !isFirstPlan ? allPlans[index - 1] : null;

  const includedLabel = isFirstPlan
    ? `Included in ${rawPlan.name}:`
    : `Everything in ${previousPlan?.name ?? ""}, plus:`;

  const isHighlighted = rawPlan.slug?.toLowerCase() === "scholar" || index === 1;

  return {
    id: rawPlan.planId,
    name: rawPlan.name,
    slug: rawPlan.slug,
    audience: rawPlan.audience,
    description: rawPlan.description,
    price: rawPlan.price,
    interval: rawPlan.interval,
    formattedPrice: formatPlanPrice(rawPlan.price),
    billingNote: rawPlan.price === 0 ? "Always free" : "Billed monthly",
    ctaLabel: `Get ${rawPlan.name}`,
    highlighted: isHighlighted,
    badge: getPlanBadge(rawPlan.slug, index),
    includedLabel,
    features: rawPlan.features ?? [],
  };
};

export const subscriptionService = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const rawPlans = await subscriptionApi.getPlans();
    return rawPlans.map((plan, index) =>
      transformPlanDtoToDomain(plan, index, rawPlans),
    );
  },
};
