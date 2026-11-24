import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { subjectLabel } from "@/core/utils/subjectLabel";
import { TestScreen, TestScreenLoading, TestScreenMessage, firstBlankIndex, groupBySubject, type FinishState, type TestScreenQuestion } from "@/features/practice";
import { useDailyChallengeSession } from "../hooks/useDailyChallengeSession";
import { formatYearMonthDay } from "../service/dailyChallengeService";
import { CompletionStatus } from "../types/dailyChallengeTypes";

/**
 * The daily challenge on the shared test screen (design approved 2026-11-24): no clock,
 * Finish instead of Submit. Answers are kept on this device until it's finished.
 */

const SEND_FAILED = "Check your connection and try again. Your answers are still here.";

const dayLabel = (date?: string) => {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  const value = new Date(y, m - 1, d);
  return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

export const DailyChallengeTestPage = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { questions: raw, answers, loading, error, isSubmitting, submitError, setSubmitError, selectAnswer, submitChallenge, refetch } = useDailyChallengeSession(date);

  const questions: TestScreenQuestion[] = useMemo(
    () =>
      groupBySubject(
        raw.map((q) => ({
          id: q.questionId,
          subject: subjectLabel(q.subjectName || "Daily challenge"),
          content: q.questionContent,
          imageUrl: q.imageUrl,
          options: q.options.map((o) => ({ id: o.label, label: o.label, content: o.content, imageUrl: o.imageUrl })),
        })),
      ),
    [raw],
  );
  const [current, setCurrent] = useState<number | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);

  // Start at the first question still blank (answers kept from earlier count)
  useEffect(() => {
    if (questions.length && current === null) setCurrent(firstBlankIndex(questions, answers) ?? 0);
  }, [questions, answers, current]);

  const title = `Daily challenge${dayLabel(date) ? ` · ${dayLabel(date)}` : ""}`;
  useEffect(() => {
    const before = document.title;
    document.title = `${title} · Fasiti`;
    return () => {
      document.title = before;
    };
  }, [title]);

  if (loading) return <TestScreenLoading label="Loading the daily challenge" />;
  if (error) return <TestScreenMessage title="We couldn't open this challenge" body="Check your connection and try again." onRetry={() => void refetch()} />;
  if (!questions.length) return <TestScreenMessage title="No challenge for this day" body={`There are no questions for ${dayLabel(date) || "this day"}. Pick another day from your dashboard.`} />;
  if (current === null) return null;

  const finishState: FinishState = isSubmitting ? "submitting" : submitError ? "failed" : "idle";

  const finish = async () => {
    if (isSubmitting) return;
    try {
      const res = await submitChallenge();
      const today = formatYearMonthDay(new Date());
      const target = date || today;
      const onTime = (!date || date === today) && res.completionStatus === CompletionStatus.Completed;
      navigate(`/daily-challenge/review/${target}`, onTime ? { replace: true, state: { showStreakModal: true, streakCount: res.currentStreakCount ?? 1 } } : { replace: true });
    } catch {
      // The hook keeps the error; the dialog says what to do
      setFinishOpen(true);
    }
  };

  return (
    <TestScreen
      title={title}
      questions={questions}
      answers={answers}
      current={current}
      onAnswer={selectAnswer}
      onGo={setCurrent}
      verb="Finish"
      finishOpen={finishOpen}
      onFinishOpenChange={(open) => {
        setFinishOpen(open);
        if (!open) setSubmitError(null);
      }}
      finishState={finishState}
      finishError={submitError ? SEND_FAILED : null}
      onConfirmFinish={() => void finish()}
      leaveBody="Your answers are kept on this device until you finish. Come back to it from your dashboard."
      onLeave={() => navigate("/dashboard")}
    />
  );
};

export default DailyChallengeTestPage;
