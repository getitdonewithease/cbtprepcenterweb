import { useCallback, useEffect, useState } from "react";
import { testHistoryService } from "../services/testHistoryService";
import type { TestRecord } from "../types/testHistoryTypes";

type HistoryState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; tests: TestRecord[] };

/** Every test the candidate has, with a retry and an in-place cancel. */
export function useTestHistory() {
  const [state, setState] = useState<HistoryState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      setState({ status: "ready", tests: await testHistoryService.getAllTests() });
    } catch {
      // The page says what happened in its own words; the backend message isn't shown
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Cancels a test; on success it shows as cancelled without reloading the page. */
  const cancel = useCallback(async (testId: string) => {
    await testHistoryService.cancelTest(testId);
    setState((current) =>
      current.status === "ready"
        ? { status: "ready", tests: current.tests.map((t) => (t.id === testId ? { ...t, status: "cancelled" } : t)) }
        : current,
    );
  }, []);

  return { state, reload: load, cancel };
}
