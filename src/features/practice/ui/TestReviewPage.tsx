import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/core/ui/cn";
import Layout, { type TutorQuestionRequest } from "@/components/common/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useSaveQuestion, useTestReview } from "../hooks/usePractice";
import type { ReviewQuestion } from "../types/practiceTypes";
import ReviewExplanation, { useExplanationPreference } from "./review/ReviewExplanation";
import ReviewQuestionList, { type ListFilter } from "./review/ReviewQuestionList";
import ReviewQuestionSheet from "./review/ReviewQuestionSheet";
import ReviewResult from "./review/ReviewResult";
import TutorPinnedQuestion from "./review/TutorPinnedQuestion";
import { outcomeOf, primaryButton, secondaryButton, subjectName, textLink } from "./review/reviewParts";

/**
 * The test review (design approved 2026-11-24): in the app frame, the result in one line,
 * the questions as numbers, each question as an answer sheet with its own explanation
 * under it (hideable), and the AI tutor beside it on request with the question pinned.
 */

const startersFor = (question: ReviewQuestion) => {
  const outcome = outcomeOf(question);
  const first =
    outcome === "wrong" ? "Why is my answer wrong?" : outcome === "skipped" ? "How do I work this out?" : "Why is this the answer?";
  return [first, "Show it step by step", "Quiz me on this topic"];
};

const BackLink = () => (
  <Link to="/test-history" className={cn(textLink, "-mt-3 mb-2 text-muted-foreground")}>
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    Test history
  </Link>
);

const TestReviewPage = () => {
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reviewData, loading, error } = useTestReview(sessionId);
  const { saveQuestion } = useSaveQuestion();
  const explanation = useExplanationPreference();

  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<ListFilter>("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tutorRequest, setTutorRequest] = useState<TutorQuestionRequest | undefined>(undefined);
  const questionRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef(false);

  const questions = reviewData?.questions ?? [];
  const question = questions[index];

  // ← and → move between questions, unless you're typing
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable], [role='menu'], [role='slider']")) return;
      if (event.key === "ArrowRight") setIndex((i) => Math.min(i + 1, questions.length - 1));
      if (event.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions.length]);

  // A new question starts from its top (the Next button sits at the bottom of the last one)
  useEffect(() => {
    if (!hasMovedRef.current) {
      hasMovedRef.current = true;
      return;
    }
    questionRef.current?.scrollIntoView({ block: "start" });
  }, [index]);

  if (loading || (!reviewData && !error)) {
    return (
      <Layout title="Test review">
        <div className="fasiti-theme max-w-[1600px] px-2 sm:px-0" aria-busy="true">
          <p role="status" className="sr-only">
            Loading your review
          </p>
          <span className="block h-4 w-40 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          <span className="mt-3 block h-8 w-56 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          <span className="mt-10 block h-40 w-full max-w-3xl animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        </div>
      </Layout>
    );
  }

  if (error || !reviewData) {
    return (
      <Layout title="Test review">
        <div className="fasiti-theme max-w-[1600px] px-2 sm:px-0">
          <BackLink />
          <div role="alert" className="max-w-xl">
            <h2 className="text-xl font-extrabold tracking-[-0.02em]">We couldn't load this review</h2>
            <p className="mt-2 text-muted-foreground">Check your connection and try again. Your answers are saved.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => window.location.reload()} className={primaryButton()}>
                Try again
              </button>
              <button type="button" onClick={() => navigate("/test-history")} className={secondaryButton()}>
                Go to test history
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout title="Test review">
        <div className="fasiti-theme max-w-[1600px] px-2 sm:px-0">
          <BackLink />
          <p className="text-muted-foreground">This test has no questions to review.</p>
        </div>
      </Layout>
    );
  }

  const showMissed = () => {
    setFilter("missed");
    const firstMissed = questions.findIndex((q) => outcomeOf(q) !== "right");
    if (firstMissed >= 0) setIndex(firstMissed);
  };

  const handleSave = async () => {
    const id = question.id;
    setSavingId(id);
    try {
      await saveQuestion(sessionId, id);
      setSavedIds((current) => new Set(current).add(id));
      toast({ title: "Question saved", description: "Find it in Saved questions.", variant: "success" });
    } catch {
      toast({ title: "Couldn't save this question", description: "Check your connection and try again.", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const askTutor = () =>
    setTutorRequest({
      requestId: Date.now(),
      question: {
        id: question.id,
        text: question.text,
        options: question.options,
        optionLetters: question.optionAlphas,
        userAnswerIndex: question.userAnswer,
        correctAnswerIndex: question.correctAnswer,
      },
      label: `${subjectName(question.subject)}, question ${index + 1}`,
      pinned: <TutorPinnedQuestion question={question} number={index + 1} />,
      starters: startersFor(question),
    });

  const saveState = savedIds.has(question.id) || question.isSaved ? "saved" : savingId === question.id ? "saving" : "idle";

  return (
    <Layout title="Test review" hasPrimaryAction tutorQuestion={tutorRequest}>
      <div className="fasiti-theme max-w-[1600px] px-2 text-foreground sm:px-0">
        <BackLink />
        <ReviewResult questions={questions} timeUsed={reviewData.durationUsed} onShowMissed={showMissed} />

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Phones: sticks to the very top of the scrolling area, over its padding, so nothing shows above it */}
          <div className="sticky -top-4 sm:-top-8 lg:top-0 z-10 -mx-2 border-b bg-card px-2 py-2 sm:-mx-4 sm:px-4 md:-mx-8 md:px-8 lg:col-span-4 lg:mx-0 lg:self-start lg:border-b-0 lg:border-r lg:bg-transparent lg:px-0 lg:py-8 lg:pr-10 xl:pr-14">
            <ReviewQuestionList questions={questions} currentIndex={index} filter={filter} onFilterChange={setFilter} onJump={setIndex} />
          </div>

          <div ref={questionRef} className="min-w-0 scroll-mt-28 py-6 lg:col-span-8 lg:scroll-mt-8 lg:py-8 lg:pl-10 xl:pl-14">
            <ReviewQuestionSheet
              question={question}
              number={index + 1}
              total={questions.length}
              saveState={saveState}
              onSave={handleSave}
              explanation={
                <ReviewExplanation question={question} shown={explanation.shown} onToggle={explanation.toggle} onAskTutor={askTutor} />
              }
            />
            <nav aria-label="Move between questions" className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
              <button type="button" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} className={secondaryButton()}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
              <button type="button" onClick={() => setIndex((i) => i + 1)} disabled={index >= questions.length - 1} className={primaryButton()}>
                Next
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestReviewPage;
