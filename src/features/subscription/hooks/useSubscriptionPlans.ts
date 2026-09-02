import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/core/errors";
import { subscriptionService } from "../service/subscriptionService";
import type { SubscriptionPlan, UseSubscriptionPlansResult } from "../types/subscriptionTypes";

export const useSubscriptionPlans = (): UseSubscriptionPlansResult => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionService.getSubscriptionPlans();
      setPlans(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load subscription plans"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await subscriptionService.getSubscriptionPlans();
        if (isMounted) {
          setPlans(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(getErrorMessage(err, "Failed to load subscription plans"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    plans,
    isLoading,
    error,
    refetch: fetchPlans,
  };
};
