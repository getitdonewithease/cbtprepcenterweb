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

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const calculatePeriodDates = () => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  const targetMonth = (endDate.getMonth() + 1) % 12;
  endDate.setMonth(endDate.getMonth() + 1);
  // Guard against month overflow (e.g. Jan 31 -> Mar 3)
  if (endDate.getMonth() !== targetMonth) {
    endDate.setDate(0);
  }
  return {
    startPeriod: formatDate(startDate),
    endPeriod: formatDate(endDate),
  };
};

const checkIsCurrentPlan = (
  rawPlan: RawPlanDto,
  activePlanName?: string,
): boolean => {
  if (!activePlanName) return false;
  const normalizedActive = activePlanName.trim().toLowerCase();
  const normalizedName = rawPlan.name?.trim().toLowerCase() ?? "";
  const normalizedSlug = rawPlan.slug?.trim().toLowerCase() ?? "";

  return (
    normalizedActive === normalizedName ||
    normalizedActive === normalizedSlug ||
    (normalizedActive === "free" && rawPlan.price === 0)
  );
};

const transformPlanDtoToDomain = (
  rawPlan: RawPlanDto,
  index: number,
  allPlans: RawPlanDto[],
  activePlanName?: string,
): SubscriptionPlan => {
  const isFirstPlan = index === 0;
  const previousPlan = !isFirstPlan ? allPlans[index - 1] : null;

  const includedLabel = isFirstPlan
    ? `Included in ${rawPlan.name}:`
    : `Everything in ${previousPlan?.name ?? ""}, plus:`;

  const isHighlighted = rawPlan.slug?.toLowerCase() === "scholar" || index === 1;
  const isCurrentPlan = checkIsCurrentPlan(rawPlan, activePlanName);

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
    ctaLabel: isCurrentPlan ? `Continue ${rawPlan.name}` : `Get ${rawPlan.name}`,
    isCurrentPlan,
    highlighted: isHighlighted,
    badge: getPlanBadge(rawPlan.slug, index),
    includedLabel,
    features: rawPlan.features ?? [],
  };
};

export const subscriptionService = {
  async getSubscriptionPlans(activePlanName?: string): Promise<SubscriptionPlan[]> {
    const rawPlans = await subscriptionApi.getPlans();
    return rawPlans.map((plan, index) =>
      transformPlanDtoToDomain(plan, index, rawPlans, activePlanName),
    );
  },

  getSubscriptionPeriod(): { startPeriod: string; endPeriod: string } {
    return calculatePeriodDates();
  },

  async initiatePayment(planId: string): Promise<string> {
    if (!planId) {
      throw new Error("Plan ID is required to initiate payment");
    }

    const { startPeriod, endPeriod } = calculatePeriodDates();
    return subscriptionApi.initiatePayment({
      planId,
      startPeriod,
      endPeriod,
    });
  },
};
