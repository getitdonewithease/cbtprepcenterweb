import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/core/errors";
import { prepareTest } from "../service/prepareTestService";
import { PrepareTestPayload } from "../types/dashboardTypes";

/**
 * Hook for preparing and starting practice tests.
 * Used by components that need to initiate test sessions.
 */
export const usePrepareTest = () => {
  const [preparing, setPreparing] = useState(false);
  const [cbtSessionId, setCbtSessionId] = useState<string | null>(null);
  const [showPreparedDialog, setShowPreparedDialog] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const navigate = useNavigate();
  const latestRequestRef = useRef(0);

  const handlePrepareTest = async (options: PrepareTestPayload) => {
    const requestId = ++latestRequestRef.current;
    const isStale = () => requestId !== latestRequestRef.current;
    setPreparing(true);
    setCbtSessionId(null);
    setPrepareError(null);
    try {
      const sessionId = await prepareTest(options);
      if (isStale()) return;
      setCbtSessionId(sessionId);
      setShowPreparedDialog(true);
    } catch (err) {
      if (isStale()) return;
      // The service only rejects with copy that is safe to show
      setPrepareError(getErrorMessage(err, "We couldn't prepare your questions. Please try again."));
    } finally {
      if (!isStale()) setPreparing(false);
    }
  };

  const handleGoToTest = async () => {
    if (!cbtSessionId) return;
    setPreparing(true);
    setPrepareError(null);
    try {
      setShowPreparedDialog(false);
      navigate(`/practice/summary/${cbtSessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch test configuration";
      setPrepareError(message);
    } finally {
      setPreparing(false);
    }
  };

  const resetPrepareTest = useCallback(() => {
    latestRequestRef.current += 1;
    setPreparing(false);
    setCbtSessionId(null);
    setShowPreparedDialog(false);
    setPrepareError(null);
  }, []);

  return {
    preparing,
    cbtSessionId,
    showPreparedDialog,
    prepareError,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
    resetPrepareTest,
    clearPrepareError: () => setPrepareError(null),
  };
};
