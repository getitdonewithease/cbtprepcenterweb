import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "@/lib/notify";
import { prepareTest as prepareTestApi } from "../api/dashboardApi";
import { PrepareTestPayload } from "../types/dashboardTypes";

/**
 * Hook for preparing and starting practice tests.
 * Used by components that need to initiate test sessions.
 */
export const usePrepareTest = () => {
  const [preparing, setPreparing] = useState(false);
  const [cbtSessionId, setCbtSessionId] = useState<string | null>(null);
  const [showPreparedDialog, setShowPreparedDialog] = useState(false);
  const navigate = useNavigate();

  const handlePrepareTest = async (options: PrepareTestPayload) => {
    setPreparing(true);
    setCbtSessionId(null);
    try {
      const sessionId = await prepareTestApi(options);
      setCbtSessionId(sessionId);
      setShowPreparedDialog(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to prepare questions";
      notify.error({
        title: "Error Preparing Questions",
        description: message,
        duration: 5000,
      });
    } finally {
      setPreparing(false);
    }
  };

  const handleGoToTest = async () => {
    if (!cbtSessionId) return;
    setPreparing(true);
    try {
      setShowPreparedDialog(false);
      navigate(`/practice/summary/${cbtSessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch test configuration";
      notify.error({
        title: "Error Loading Test",
        description: message,
        duration: 5000,
      });
    } finally {
      setPreparing(false);
    }
  };

  return {
    preparing,
    cbtSessionId,
    showPreparedDialog,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
  };
};
