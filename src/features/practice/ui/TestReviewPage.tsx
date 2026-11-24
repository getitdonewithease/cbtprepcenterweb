import { useParams } from "react-router-dom";
import { useSaveQuestion, useTestReview } from "../hooks/usePractice";
import ReviewView from "./review/ReviewView";
import { formatTimeUsed } from "./review/reviewParts";

/** The test review: loads one test's answers and shows them in the shared review view. */
const TestReviewPage = () => {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const { reviewData, loading, error } = useTestReview(sessionId);
  const { saveQuestion } = useSaveQuestion();
  const timeUsed = formatTimeUsed(reviewData?.durationUsed);

  return (
    <ReviewView
      title="Test review"
      status={loading || (!reviewData && !error) ? "loading" : error || !reviewData ? "error" : "ready"}
      questions={reviewData?.questions ?? []}
      detail={timeUsed ? `Time used: ${timeUsed}` : undefined}
      back={{ to: "/test-history", label: "Test history" }}
      // The hook fetches once per session id; a reload is the honest retry
      onRetry={() => window.location.reload()}
      emptyMessage="This test has no questions to review."
      onSaveQuestion={(questionId) => saveQuestion(sessionId, questionId)}
    />
  );
};

export default TestReviewPage;
