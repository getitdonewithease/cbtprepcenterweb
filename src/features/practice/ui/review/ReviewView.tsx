import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/core/ui/cn";
import Layout, { type TutorQuestionRequest } from "@/components/common/Layout";
import { useToast } from "@/components/ui/use-toast";
import type { ReviewQuestion } from "../../types/practiceTypes";
import ReviewExplanation, { useExplanationPreference } from "./ReviewExplanation";
import ReviewQuestionList, { type ListFilter } from "./ReviewQuestionList";
import ReviewQuestionSheet from "./ReviewQuestionSheet";
import ReviewResult from "./ReviewResult";
import TutorPinnedQuestion from "./TutorPinnedQuestion";
import { outcomeOf, primaryButton, secondaryButton, subjectName, textLink } from "./reviewParts";

/**
 * The review of answered questions (design approved 2026-11-24), shared by the test review
 * and the daily challenge review. In the app frame: the result in one line, the questions as
 * numbers, each question as an answer sheet with its own explanation under it (hideable),
 * and the AI tutor beside it on request with the question pinned. Pages only load and map
 * their data; everything a candidate sees and does here is the same on both.
 */

export interface ReviewViewProps {
  /** The top bar title, e.g. "Test review". */
  title: string;
  status: "loading" | "error" | "ready";
  questions: ReviewQuestion[];
  /** Above the result, e.g. "Time used: 7 s" or "Completed on 21 Nov, late". */
  detail?: string;
  back: { to: string; label: string };
  onRetry: () => void;
  emptyMessage: string;
  /** What to do instead when there is nothing to review. */
  emptyAction?: { to: string; label: string };
  /** Saves a question to Saved questions; absent where questions can't be saved. */
  onSaveQuestion?: (questionId: string) => Promise<unknown>;
}

const startersFor = (question: ReviewQuestion) => {
  const outcome = outcomeOf(question);
  const first =
    outcome === "wrong" ? "Why is my answer wrong?" : outcome === "skipped" ? "How do I work this out?" : "Why is this the answer?";
  return [first, "Show it step by step", "Quiz me on this topic"];
};

const PAGE = "fasiti-theme max-w-[1600px] px-2 text-foreground sm:px-0";

const BackLink = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className={cn(textLink, "-mt-3 mb-2 text-muted-foreground")}>
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    {label}
  </Link>
);

const ReviewView = ({ title, status, questions, detail, back, onRetry, emptyMessage, emptyAction, onSaveQuestion }: ReviewViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const explanation = useExplanationPreference();

  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<ListFilter>("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tutorRequest, setTutorRequest] = useState<TutorQuestionRequest | undefined>(undefined);
  const questionRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef(false);

  const question = questions[Math.min(index, Math.max(questions.length - 1, 0))];

  // ← and → move between questions, unless you're typing
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable], [role='menu'], [role='slider'], [role='dialog']")) return;
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

  if (status === "loading") {
    return (
      <Layout title={title} darkReady>
        <div className={PAGE} aria-busy="true">
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

  if (status === "error") {
    return (
      <Layout title={title} darkReady>
        <div className={PAGE}>
          <BackLink {...back} />
          <div role="alert" className="max-w-xl">
            <h2 className="text-xl font-extrabold tracking-[-0.02em]">We couldn't load this review</h2>
            <p className="mt-2 text-muted-foreground">Check your connection and try again. Your answers are saved.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onRetry} className={primaryButton()}>
                Try again
              </button>
              <button type="button" onClick={() => navigate(back.to)} className={secondaryButton()}>
                {back.label}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout title={title} darkReady>
        <div className={PAGE}>
          <BackLink {...back} />
          <p className="text-muted-foreground">{emptyMessage}</p>
          {emptyAction && (
            <Link to={emptyAction.to} className={primaryButton("mt-5")}>
              {emptyAction.label}
            </Link>
          )}
        </div>
      </Layout>
    );
  }

  const showMissed = () => {
    setFilter("missed");
    const firstMissed = questions.findIndex((q) => outcomeOf(q) !== "right");
    if (firstMissed >= 0) setIndex(firstMissed);
  };

  const handleSave = onSaveQuestion
    ? async () => {
        const id = question.id;
        setSavingId(id);
        try {
          await onSaveQuestion(id);
          setSavedIds((current) => new Set(current).add(id));
          toast({ title: "Question saved", description: "Find it in Saved questions.", variant: "success" });
        } catch {
          toast({ title: "Couldn't save this question", description: "Check your connection and try again.", variant: "destructive" });
        } finally {
          setSavingId(null);
        }
      }
    : undefined;

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
    <Layout title={title} darkReady hasPrimaryAction tutorQuestion={tutorRequest}>
      <div className={PAGE}>
        <BackLink {...back} />
        <ReviewResult questions={questions} detail={detail} onShowMissed={showMissed} />

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Phones: sticks to the very top of the scrolling area, over its padding, so nothing shows above it */}
          <div className="sticky -top-4 z-10 -mx-2 border-b bg-card px-2 py-2 sm:-top-8 sm:-mx-4 sm:px-4 md:-mx-8 md:px-8 lg:top-0 lg:col-span-4 lg:mx-0 lg:self-start lg:border-b-0 lg:border-r lg:bg-transparent lg:px-0 lg:py-8 lg:pr-10 xl:pr-14">
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

export default ReviewView;
