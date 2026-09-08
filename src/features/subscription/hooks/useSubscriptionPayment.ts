import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/core/errors";
import { subscriptionService } from "../service/subscriptionService";
import type { SubscriptionPlan } from "../types/subscriptionTypes";

export interface UseSubscriptionPaymentResult {
  initiatingPlanId: string | null;
  isInitiating: boolean;
  error: string | null;
  initiatePayment: (plan: SubscriptionPlan) => Promise<boolean>;
}

export const useSubscriptionPayment = (): UseSubscriptionPaymentResult => {
  const [initiatingPlanId, setInitiatingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initiatePayment = useCallback(
    async (plan: SubscriptionPlan): Promise<boolean> => {
      if (plan.isCurrentPlan || plan.price === 0) {
        return false;
      }

      try {
        setInitiatingPlanId(plan.id);
        setError(null);

        const checkoutUrl = await subscriptionService.initiatePayment(plan.id);

        if (!checkoutUrl) {
          throw new Error("Payment provider did not return a checkout URL");
        }

        const newWindow = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        if (!newWindow) {
          window.location.href = checkoutUrl;
        }

        return true;
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Failed to initiate payment. Please try again.",
        );
        setError(errorMessage);
        toast({
          title: "Payment Initiation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setInitiatingPlanId(null);
      }
    },
    [toast],
  );

  return {
    initiatingPlanId,
    isInitiating: Boolean(initiatingPlanId),
    error,
    initiatePayment,
  };
};
