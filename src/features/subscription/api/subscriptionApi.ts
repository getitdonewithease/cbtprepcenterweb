import api from "@/core/api/httpClient";
import type { GetPlansApiResponse, RawPlanDto } from "../types/subscriptionTypes";

export const subscriptionApi = {
  async getPlans(): Promise<RawPlanDto[]> {
    const response = await api.get<GetPlansApiResponse>("/api/v1/plans");

    if (response.data?.isSuccess && response.data.value?.plans) {
      return response.data.value.plans;
    }

    throw new Error(response.data?.message || "Failed to fetch subscription plans");
  },
};
