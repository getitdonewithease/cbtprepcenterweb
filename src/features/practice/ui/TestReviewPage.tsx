import { useLocation, useParams } from "react-router-dom";
import Layout from "@/components/common/Layout";
import { useUserContext } from "@/features/dashboard";
import { useSaveQuestion, useTestReview } from "../hooks/usePractice";
import { useTestResult } from "../hooks/useTestResult";
import ReviewView from "./review/ReviewView";
import { ResultTop, WaitForMark, isJustFinished } from "./review/ResultArrival";
import { outcomeOf } from "./review/reviewParts";

/**
 * A test's review, which is also where a candidate lands after submitting (design approved
 * 2026-11-24): an honest wait while the answers are marked, then the result at the top (the
 * mark, the goal, the change since the last full test, each subject) and the review below.
 */
const TestReviewPage = () => {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const sent = (location.state as { finished?: unknown } | null)?.finished;
  const finished = isJustFinished(sent) ? sent : null;
  const { state, checkAgain } = useTestResult(sessionId);
  const marked = state.phase === "marked";
  const { reviewData, loading, error } = useTestReview(sessionId, marked);
  const { saveQuestion } = useSaveQuestion();
  const { user } = useUserContext();

  if (!marked) {
    return (
      <Layout title="Test review" darkReady hasPrimaryAction>
        <div className="fasiti-theme max-w-[1600px] px-2 text-foreground sm:px-0">
          {state.phase === "marking" && !finished ? (
            // Opened later: usually already marked, so a quiet placeholder rather than "your answers are in"
            <div aria-busy="true">
              <p role="status" className="sr-only">
                Loading your result
              </p>
              <span className="block h-16 w-48 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
              <span className="mt-4 block h-5 w-full max-w-md animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            </div>
          ) : (
            <WaitForMark
              finished={finished}
              phase={state.phase}
              slow={state.phase === "marking" && state.slow}
              cancelled={state.phase === "failed" && state.cancelled}
              onCheckAgain={checkAgain}
            />
          )}
        </div>
      </Layout>
    );
  }

  const questions = reviewData?.questions ?? [];
  const missed = questions.filter((q) => outcomeOf(q) !== "right").length;

  return (
    <ReviewView
      title="Test review"
      status={loading || (!reviewData && !error) ? "loading" : error || !reviewData ? "error" : "ready"}
      questions={questions}
      back={{ to: "/test-history", label: "Test history" }}
      // The hook fetches once per session id; a reload is the honest retry
      onRetry={() => window.location.reload()}
      emptyMessage="This test has no questions to review."
      onSaveQuestion={(questionId) => saveQuestion(sessionId, questionId)}
      result={(showMissed) => (
        <ResultTop result={state.result} previous={state.previous} goal={user?.targetScore} finished={finished} missed={missed} onShowMissed={showMissed} />
      )}
    />
  );
};

export default TestReviewPage;
