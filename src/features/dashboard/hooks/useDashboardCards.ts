import { useEffect, useState } from "react";
import { getErrorMessage } from "@/core/errors";
import { fetchDashboardCards } from "../api/dashboardApi";
import { DashboardCards } from "../types/dashboardTypes";

export const useDashboardCards = () => {
  const [cards, setCards] = useState<DashboardCards | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCards = async () => {
      try {
        setCardsLoading(true);
        setCardsError("");
        const cardsData = await fetchDashboardCards();
        if (!isMounted) {
          return;
        }
        setCards(cardsData);
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }
        setCardsError(getErrorMessage(error, "Failed to load dashboard cards"));
      } finally {
        if (isMounted) {
          setCardsLoading(false);
        }
      }
    };

    loadCards();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    cards,
    cardsLoading,
    cardsError,
  };
};
