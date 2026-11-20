import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock3, Trophy } from "lucide-react";
import { cn } from "@/core/ui/cn";

// ── DemoWrapper ──────────────────────────────────────────────────────────────
// Swap in a real video or screenshot by adding the `src` prop.
// Leave `src` undefined to show the animated mockup child.
//
// Usage:
//   <DemoWrapper>                                          ← animated mockup
//   <DemoWrapper src="/demos/cbt.mp4" alt="…">             ← real video (autoPlay loop muted)
//   <DemoWrapper src="/screenshots/ai.png" alt="…">        ← real screenshot

interface DemoWrapperProps {
  src?: string;
  /** Describe what the recording or screenshot shows; required once `src` is set */
  alt?: string;
  className?: string;
  children: React.ReactNode;
}

export const DemoWrapper = ({ src, alt = "", className = "", children }: DemoWrapperProps) => {
  if (!src) return <>{children}</>;
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  return isVideo ? (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      aria-label={alt || undefined}
      className={`w-full rounded-2xl ${className}`}
    />
  ) : (
    <img src={src} alt={alt} className={`w-full rounded-2xl ${className}`} />
  );
};

// ── Playback control shared by every demo ────────────────────────────────────
// Loops run only while the demo is on screen and the tab is visible, and never under
// reduced motion (each demo then renders its finished state as a still).

const useDemoPlayback = () => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(node);
    const onVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    ref,
    prefersReducedMotion,
    isPlaying: isOnScreen && isTabVisible && !prefersReducedMotion,
  };
};

/** Mockups are pictures of the product: one spoken summary instead of their parts. */
const demoA11y = (label: string) => ({ role: "img" as const, "aria-label": label });

// ── CbtDemo ──────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    subject: "Mathematics",
    qNum: 18,
    text: "If log₁₀ x = 2, what is the value of x?",
    options: ["A.  20", "B.  100", "C.  200", "D.  1000"],
    correct: 1,
    startSeconds: 28 * 60 + 43,
  },
  {
    subject: "Physics",
    qNum: 12,
    text: "Which of the following is a scalar quantity?",
    options: ["A.  Velocity", "B.  Force", "C.  Speed", "D.  Displacement"],
    correct: 2,
    startSeconds: 26 * 60 + 15,
  },
];

type CbtPhase = "question" | "selecting" | "saved";

export const CbtDemo = () => {
  const { ref, prefersReducedMotion, isPlaying } = useDemoPlayback();
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<CbtPhase>(prefersReducedMotion ? "saved" : "question");
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].startSeconds);

  const q = QUESTIONS[qIndex];

  // Countdown ticks only while playing
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Phase machine: restarts for each question, pauses off screen
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase("saved");
      return;
    }
    if (!isPlaying) return;
    setPhase("question");
    setTimeLeft(QUESTIONS[qIndex].startSeconds);
    const t1 = setTimeout(() => setPhase("selecting"), 3000);
    const t2 = setTimeout(() => setPhase("saved"), 5000);
    const t3 = setTimeout(() => setQIndex((i) => (i + 1) % QUESTIONS.length), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [qIndex, isPlaying, prefersReducedMotion]);

  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div
      ref={ref}
      {...demoA11y(
        "Example timed CBT question: a countdown timer, a mathematics question with four options, and the chosen answer saved until you submit.",
      )}
      className="rounded-2xl border bg-card p-5 shadow-soft"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header changes together with its question */}
          <div className="mb-4 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              {q.subject} · Question {q.qNum} of 40
            </span>
            <span className="flex items-center gap-1 font-bold tabular-nums text-brand-text">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {mins}:{secs}
            </span>
          </div>

          <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">{q.text}</p>

          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, i) => {
              const isChosen = phase !== "question" && i === q.correct;
              return (
                <motion.div
                  key={opt}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-xs transition-colors duration-200",
                    isChosen
                      ? "border-brand-orange bg-brand-orange/[0.12] font-semibold text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                  animate={phase === "selecting" && i === q.correct ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {opt}
                </motion.div>
              );
            })}
          </div>

          <div
            className={cn(
              "mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-opacity duration-300",
              phase === "saved" ? "opacity-100" : "opacity-0",
            )}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Answer saved. Marked when you submit.
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── AiExplanationDemo ────────────────────────────────────────────────────────

const USER_MSG = "Why is the answer 20m? I keep getting 10m.";
const AI_RESPONSE =
  "Using v² = u² − 2gh, when v = 0 at max height: h = u²/2g = 400 ÷ 20 = 20 m. Answer: B ✓";

type AiPhase = "user" | "thinking" | "streaming" | "complete";

export const AiExplanationDemo = () => {
  const { ref, prefersReducedMotion, isPlaying } = useDemoPlayback();
  const [cycleCount, setCycleCount] = useState(0);
  // Opens on the student's question so the card is never an empty frame
  const [phase, setPhase] = useState<AiPhase>(prefersReducedMotion ? "complete" : "user");
  const [displayedResponse, setDisplayedResponse] = useState(prefersReducedMotion ? AI_RESPONSE : "");

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase("complete");
      setDisplayedResponse(AI_RESPONSE);
      return;
    }
    if (!isPlaying) return;

    setPhase("user");
    setDisplayedResponse("");
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let streamInterval: ReturnType<typeof setInterval> | null = null;

    timeouts.push(setTimeout(() => setPhase("thinking"), 1400));
    timeouts.push(
      setTimeout(() => {
        setPhase("streaming");
        let i = 0;
        streamInterval = setInterval(() => {
          i++;
          setDisplayedResponse(AI_RESPONSE.slice(0, i));
          if (i >= AI_RESPONSE.length) {
            if (streamInterval) clearInterval(streamInterval);
            streamInterval = null;
            setPhase("complete");
          }
        }, 28);
      }, 2800),
    );
    // Hold the finished answer, then replay
    timeouts.push(setTimeout(() => setCycleCount((c) => c + 1), 11500));

    return () => {
      timeouts.forEach(clearTimeout);
      if (streamInterval) clearInterval(streamInterval);
    };
  }, [cycleCount, isPlaying, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      {...demoA11y(
        "Example AI tutor chat: a student asks why the answer is 20 metres, and the tutor works through v squared equals u squared minus 2gh to show the answer is B.",
      )}
      className="overflow-hidden rounded-2xl border bg-card shadow-soft"
    >
      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
          AI
        </div>
        <div>
          <p className="text-xs font-bold leading-none">Fasiti AI Tutor</p>
          <p className="mt-1 text-xs text-muted-foreground">Explains the questions you got wrong</p>
        </div>
      </div>

      {/* Message area */}
      <div className="flex min-h-[172px] flex-col justify-end gap-3 p-4">
        <div className="flex justify-end">
          <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-xs leading-relaxed text-primary-foreground">
            {USER_MSG}
          </div>
        </div>

        <AnimatePresence>
          {phase === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === "streaming" || phase === "complete") && (
          <motion.div
            key="ai-response"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[78%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-xs leading-relaxed text-foreground"
          >
            {displayedResponse}
            {phase === "streaming" && (
              <span className="ml-0.5 inline-block h-3 w-0.5 bg-foreground/60 align-middle motion-safe:animate-pulse" />
            )}
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2">
          <span className="flex-1 text-xs text-muted-foreground">Ask a follow-up question</span>
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── LeaderboardDemo ──────────────────────────────────────────────────────────

const BASE_PLAYERS = [
  { id: "amara", name: "Amara O.", score: 312 },
  { id: "chukwu", name: "Chukwu E.", score: 298 },
  { id: "bello", name: "Bello A.", score: 284 },
  { id: "fatima", name: "Fatima Y.", score: 271 },
  { id: "you", name: "You", score: 245 },
];

const YOU_SCORES = [245, 275, 288, 302, 318];
const FINAL_STEP = YOU_SCORES.length - 1;

export const LeaderboardDemo = () => {
  const { ref, prefersReducedMotion, isPlaying } = useDemoPlayback();
  const [cycleCount, setCycleCount] = useState(0);
  const [scoreStep, setScoreStep] = useState(prefersReducedMotion ? FINAL_STEP : 0);
  const youScore = YOU_SCORES[scoreStep];

  useEffect(() => {
    if (prefersReducedMotion) {
      setScoreStep(FINAL_STEP);
      return;
    }
    if (!isPlaying) return;

    setScoreStep(0);
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    YOU_SCORES.slice(1).forEach((_, i) => {
      timeouts.push(setTimeout(() => setScoreStep(i + 1), (i + 1) * 2500));
    });
    timeouts.push(setTimeout(() => setCycleCount((c) => c + 1), 16000));
    return () => timeouts.forEach(clearTimeout);
  }, [cycleCount, isPlaying, prefersReducedMotion]);

  const players = BASE_PLAYERS.map((p) => (p.id === "you" ? { ...p, score: youScore } : p)).sort(
    (a, b) => b.score - a.score,
  );

  return (
    <div
      ref={ref}
      {...demoA11y(
        "Example weekly leaderboard: your score climbs from 245 to 318 as you finish tests, moving you from fifth place to first this week.",
      )}
      className="overflow-hidden rounded-2xl border bg-card shadow-soft"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Trophy className="h-4 w-4 text-brand-text" aria-hidden="true" />
        <p className="text-xs font-bold">National Leaderboard</p>
        <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          This week
        </span>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5 p-3">
        {players.map((player, i) => {
          const rank = i + 1;
          const isYou = player.id === "you";
          return (
            <motion.div
              key={player.id}
              layout={!prefersReducedMotion}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                isYou ? "border border-brand-orange bg-brand-orange/10" : "bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "w-7 shrink-0 text-center text-xs font-black tabular-nums",
                  // The leader is marked in brand orange; medal colours failed contrast
                  rank === 1 ? "text-brand-text" : "text-muted-foreground",
                )}
              >
                #{rank}
              </span>
              <span className={cn("flex-1 text-xs font-semibold", !isYou && "text-muted-foreground")}>
                {player.name}
              </span>
              <motion.span
                key={`${player.id}-${player.score}`}
                initial={{ scale: isYou && scoreStep > 0 && !prefersReducedMotion ? 1.25 : 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35 }}
                className={cn(
                  "text-xs font-bold tabular-nums",
                  isYou ? "text-brand-text" : "text-muted-foreground",
                )}
              >
                {player.score}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer status */}
      <div className="border-t px-4 py-2.5 text-center">
        <span className="text-xs text-muted-foreground">
          {scoreStep === 0
            ? "Finish tests to climb the ranks"
            : scoreStep < FINAL_STEP
              ? `Up ${scoreStep} place${scoreStep > 1 ? "s" : ""} this week`
              : "#1 this week"}
        </span>
      </div>
    </div>
  );
};

// ── RecommendationsMockup ────────────────────────────────────────────────────

// Lowest proficiency first, as the dashboard's weak-areas list orders them
const RECS = [
  { topic: "Organic Chemistry", subject: "Chemistry", pct: 42 },
  { topic: "Wave-Particle Duality", subject: "Physics", pct: 58 },
  { topic: "Comprehension Passages", subject: "Use of English", pct: 64 },
] as const;

export const RecommendationsMockup = () => (
  <div
    {...demoA11y(
      "Example study plan: your three weakest topics with their proficiency, Organic Chemistry at 42 percent, Wave-Particle Duality at 58 percent and Comprehension Passages at 64 percent, each with study resources.",
    )}
    className="overflow-hidden rounded-2xl border bg-card shadow-soft"
  >
    <div className="flex items-center gap-2 border-b px-4 py-3">
      <p className="text-xs font-bold">Topics to study next</p>
    </div>

    {/* One flat list: rows divided by rules, not cards inside the card */}
    <ul className="divide-y">
      {RECS.map(({ topic, subject, pct }) => (
        <li key={topic} className="px-4 py-3.5">
          <p className="mb-0.5 text-sm font-bold leading-tight">{topic}</p>
          <p className="mb-2.5 text-xs text-muted-foreground">
            {subject} · <span className="tabular-nums">{pct}%</span> proficiency
          </p>
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand-orange" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-brand-text">See resources</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
