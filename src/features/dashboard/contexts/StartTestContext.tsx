import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { getAccessToken } from "@/core/auth/tokenStorage";
import { usePrepareTest } from "../hooks/usePrepareTest";
import type { PrepareTestPayload } from "../types/dashboardTypes";

type StartTestContextValue = ReturnType<typeof usePrepareTest> & {
  isSetupOpen: boolean;
  setSetupOpen: (open: boolean) => void;
  isProgressOpen: boolean;
  setProgressOpen: (open: boolean) => void;
  openSetup: (opener: HTMLElement) => void;
  startPreparing: (options: PrepareTestPayload) => Promise<void>;
  returnFocus: () => void;
};

const StartTestContext = createContext<StartTestContextValue | undefined>(undefined);

/**
 * Lives above the routes: every page mounts its own Layout, so a test that keeps
 * preparing "in the background" would otherwise be lost when the student changes page.
 */
export function StartTestProvider({ children }: { children: ReactNode }) {
  const prepare = usePrepareTest();
  const { handlePrepareTest, resetPrepareTest } = prepare;
  const [isSetupOpen, setSetupOpen] = useState(false);
  const [isProgressOpen, setProgressOpen] = useState(true);
  const openerRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setSetupOpen(false);
    // Signed out: never hand a prepared test to whoever signs in next
    if (!getAccessToken()) resetPrepareTest();
  }, [pathname, resetPrepareTest]);

  const openSetup = (opener: HTMLElement) => {
    openerRef.current = opener;
    setSetupOpen(true);
  };

  const startPreparing = (options: PrepareTestPayload) => {
    setProgressOpen(true);
    return handlePrepareTest(options);
  };

  const returnFocus = useCallback(() => {
    // One dialog can hand over to the next, which then owns focus
    if (document.querySelector('[role="dialog"][data-state="open"]')) return;

    const opener = openerRef.current;
    const canFocusOpener = opener?.isConnected && !opener.matches(":disabled");
    const target = canFocusOpener ? opener : document.getElementById("main-content");
    target?.focus();
  }, []);

  return (
    <StartTestContext.Provider
      value={{
        ...prepare,
        isSetupOpen,
        setSetupOpen,
        isProgressOpen,
        setProgressOpen,
        openSetup,
        startPreparing,
        returnFocus,
      }}
    >
      {children}
    </StartTestContext.Provider>
  );
}

export function useStartTest() {
  const context = useContext(StartTestContext);
  if (context === undefined) {
    throw new Error("useStartTest must be used within a StartTestProvider");
  }
  return context;
}
