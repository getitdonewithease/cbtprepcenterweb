import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { firstBlankIndex } from "../service/testScreenService";
import { LOAD_FAILED, practiceTestService } from "../service/practiceTestService";
import type { FinishState, TestScreenAnswers, TestScreenQuestion } from "../types/testScreenTypes";
import { isFullscreenSupported } from "../utils/deviceDetection";

/**
 * A practice test while it's taken. One save loop: a change is saved within 15 seconds, any
 * unsaved change again every minute, and on leaving or hiding the page. Sending happens once:
 * a second press, or the clock running out mid-send, waits for the first. A failed send says
 * so and offers to try again; it never pretends to have worked.
 */

export type PracticeTestState =
  | { status: "loading" }
  | { status: "error"; title: string; message: string; canRetry: boolean }
  | { status: "ready" };

const SAVE_AFTER_MS = 15_000;
const SAVE_EVERY_MS = 60_000;

/** A computer with a mouse: full screen is asked for here, not on phones or tablets. */
const isComputer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;

export const usePracticeTest = (cbtSessionId: string | undefined) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<PracticeTestState>({ status: "loading" });
  const [questions, setQuestions] = useState<TestScreenQuestion[]>([]);
  const [answers, setAnswers] = useState<TestScreenAnswers>({});
  const [current, setCurrent] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishState, setFinishState] = useState<FinishState>("idle");
  const [finishError, setFinishError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [leftTab, setLeftTab] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(() => typeof document !== "undefined" && Boolean(document.fullscreenElement));

  // The latest values, for timers and page events
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const endRef = useRef<number | null>(null);
  const dirty = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const sending = useRef(false);
  const sent = useRef(false);
  answersRef.current = answers;
  questionsRef.current = questions;
  endRef.current = endTime;

  const secondsLeft = () => (endRef.current ? Math.max(0, Math.round((endRef.current - Date.now()) / 1000)) : 0);

  const load = useCallback(async () => {
    if (!cbtSessionId) {
      setState({ status: "error", title: "We couldn't open this test", message: LOAD_FAILED, canRetry: false });
      return;
    }
    setState({ status: "loading" });
    try {
      const data = await practiceTestService.load(cbtSessionId);
      if (data.status === "submitted") {
        navigate(`/practice/review/${cbtSessionId}`, { replace: true });
        return;
      }
      if (data.status === "cancelled") {
        setState({ status: "error", title: "This test was cancelled", message: "It can't be taken any more. Start a new one from your dashboard.", canRetry: false });
        return;
      }
      if (data.questions.length === 0) {
        setState({ status: "error", title: "This test has no questions", message: "Go back and start a new one.", canRetry: false });
        return;
      }
      setQuestions(data.questions);
      setAnswers(data.answers);
      // Carry on at the first question still blank
      setCurrent(firstBlankIndex(data.questions, data.answers) ?? 0);
      setEndTime(Date.now() + data.secondsLeft * 1000);
      setState({ status: "ready" });
    } catch (e) {
      setState({ status: "error", title: "We couldn't open this test", message: e instanceof Error ? e.message : LOAD_FAILED, canRetry: true });
    }
  }, [cbtSessionId, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    if (!cbtSessionId || !dirty.current || sending.current || sent.current) return;
    dirty.current = false;
    const ok = await practiceTestService.save(cbtSessionId, questionsRef.current, answersRef.current, secondsLeft());
    if (!ok) dirty.current = true;
    setSaveFailed(!ok);
  }, [cbtSessionId]);

  const ready = state.status === "ready";

  // Every minute, anything not yet saved
  useEffect(() => {
    if (!ready) return;
    const t = window.setInterval(() => void save(), SAVE_EVERY_MS);
    return () => window.clearInterval(t);
  }, [ready, save]);

  // Leaving, closing or hiding the page: save with a request the browser finishes on its own
  useEffect(() => {
    if (!ready || !cbtSessionId) return;
    let lastSent = -1;
    const onExit = () => {
      if (sending.current || sent.current) return;
      const left = secondsLeft();
      if (left === lastSent) return;
      lastSent = left;
      practiceTestService.saveOnExit(cbtSessionId, questionsRef.current, answersRef.current, left);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        onExit();
        setLeftTab(true);
      }
    };
    const onFullScreen = () => setIsFullScreen(Boolean(document.fullscreenElement));
    window.addEventListener("pagehide", onExit);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullScreen);
    return () => {
      window.removeEventListener("pagehide", onExit);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullScreen);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [ready, cbtSessionId]);

  const onAnswer = (questionId: string, optionId: string) => {
    if (timeUp || sending.current) return;
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
    dirty.current = true;
    if (!saveTimer.current) {
      saveTimer.current = window.setTimeout(() => {
        saveTimer.current = null;
        void save();
      }, SAVE_AFTER_MS);
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  };

  const submit = useCallback(async () => {
    if (!cbtSessionId || sending.current || sent.current) return;
    sending.current = true;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setFinishState("submitting");
    setFinishError(null);
    try {
      await practiceTestService.submit(cbtSessionId, questionsRef.current, answersRef.current, secondsLeft());
      sent.current = true;
      exitFullScreen();
      navigate(`/submission-success/${cbtSessionId}`, { replace: true });
    } catch (e) {
      setFinishState("failed");
      setFinishError(e instanceof Error ? e.message : null);
      setFinishOpen(true);
    } finally {
      sending.current = false;
    }
  }, [cbtSessionId, navigate]);

  const onTimeUp = useCallback(() => {
    setTimeUp(true);
    setFinishOpen(true);
    void submit();
  }, [submit]);

  const leave = async () => {
    if (cbtSessionId && !sent.current) {
      dirty.current = true;
      await save();
    }
    exitFullScreen();
    if (location.key !== "default") navigate(-1);
    else navigate("/dashboard");
  };

  const wantsFullScreen = isComputer() && isFullscreenSupported();

  return {
    state,
    reload: load,
    questions,
    answers,
    current,
    setCurrent,
    onAnswer,
    endTime,
    timeUp,
    onTimeUp,
    finishOpen,
    setFinishOpen: (open: boolean) => {
      setFinishOpen(open);
      // Closing after a failed send goes back to the test; opening again starts afresh
      if (!open && finishState === "failed") setFinishState("idle");
    },
    finishState,
    finishError,
    submit,
    leave,
    saveFailed,
    leftTab,
    dismissLeftTab: () => setLeftTab(false),
    showFullScreenNote: wantsFullScreen && !isFullScreen,
    enterFullScreen: () => void document.documentElement.requestFullscreen?.().catch(() => undefined),
  };
};
