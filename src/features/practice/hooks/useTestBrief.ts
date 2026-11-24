import { useCallback, useEffect, useRef, useState } from "react";
import { LOAD_ERROR, testBriefService, type TestBrief } from "../service/testBriefService";

export type TestBriefState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; brief: TestBrief };

/** The test a candidate is about to take (or carry on), for the page before it. */
export const useTestBrief = (cbtSessionId: string | undefined) => {
  const [state, setState] = useState<TestBriefState>({ status: "loading" });
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    if (!cbtSessionId) {
      setState({ status: "error", message: LOAD_ERROR });
      return;
    }
    setState({ status: "loading" });
    try {
      const brief = await testBriefService.getBrief(cbtSessionId);
      if (request === latest.current) setState({ status: "ready", brief });
    } catch (error) {
      if (request === latest.current) setState({ status: "error", message: error instanceof Error ? error.message : LOAD_ERROR });
    }
  }, [cbtSessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, reload: load };
};
