import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Trophy } from "lucide-react";

const orange = "hsl(var(--brand-orange))";

// ── DemoWrapper ──────────────────────────────────────────────────────────────
// Swap in a real video or GIF by adding the `src` prop.
// Leave `src` undefined to show the animated mockup child.
//
// Usage:
//   <DemoWrapper>                          ← animated mockup
//   <DemoWrapper src="/demos/cbt.mp4">     ← real video (autoPlay loop muted)
//   <DemoWrapper src="/demos/ai.gif">      ← real GIF

interface DemoWrapperProps {
  src?: string;
  alt?: string;
  className?: string;
  children: React.ReactNode;
}

export const DemoWrapper = ({
  src,
  alt = "Feature demo",
  className = "",
  children,
}: DemoWrapperProps) => {
  if (!src) return <>{children}</>;
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  return isVideo ? (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className={`w-full rounded-2xl ${className}`}
    />
  ) : (
    <img src={src} alt={alt} className={`w-full rounded-2xl ${className}`} />
  );
};

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
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<CbtPhase>("question");
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].startSeconds);

  const q = QUESTIONS[qIndex];

  // Live countdown
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [qIndex]);

  // Phase machine — restarts each time qIndex changes
  useEffect(() => {
    setPhase("question");
    setTimeLeft(q.startSeconds);
    const t1 = setTimeout(() => setPhase("selecting"), 3000);
    const t2 = setTimeout(() => setPhase("saved"), 5000);
    const t3 = setTimeout(
      () => setQIndex(i => (i + 1) % QUESTIONS.length),
      9000
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [qIndex]);

  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          {q.subject} · Q.{q.qNum} of 40
        </span>
        <span className="font-mono font-bold" style={{ color: orange }}>
          ⏱ {mins}:{secs}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
        >
          <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">
            {q.text}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, i) => (
              <motion.div
                key={i}
                className="rounded-lg border px-3 py-2.5 text-xs"
                style={
                  phase !== "question" && i === q.correct
                    ? {
                        borderColor: orange,
                        backgroundColor: "hsl(25 95% 53% / 0.12)",
                        color: "hsl(var(--foreground))",
                        fontWeight: 600,
                      }
                    : {
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                      }
                }
                animate={
                  phase === "selecting" && i === q.correct
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.25 }}
              >
                {opt}
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {phase === "saved" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              >
                <Check className="h-3.5 w-3.5" />
                Answer saved. Marked when you submit.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── AiExplanationDemo ────────────────────────────────────────────────────────

const USER_MSG = "Why is the answer 20m? I keep getting 10m.";
const AI_RESPONSE =
  "Using v² = u² − 2gh, when v = 0 at max height: h = u²/2g = 400 ÷ 20 = 20 m. Answer: B ✓";

type AiPhase = "idle" | "user" | "thinking" | "streaming" | "complete";

export const AiExplanationDemo = () => {
  const [cycleCount, setCycleCount] = useState(0);
  const [phase, setPhase] = useState<AiPhase>("idle");
  const [displayedResponse, setDisplayedResponse] = useState("");

  useEffect(() => {
    setPhase("idle");
    setDisplayedResponse("");

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let streamInterval: ReturnType<typeof setInterval> | null = null;

    timeouts.push(setTimeout(() => setPhase("user"), 900));
    timeouts.push(setTimeout(() => setPhase("thinking"), 2600));
    timeouts.push(
      setTimeout(() => {
        setPhase("streaming");
        let i = 0;
        streamInterval = setInterval(() => {
          i++;
          setDisplayedResponse(AI_RESPONSE.slice(0, i));
          if (i >= AI_RESPONSE.length) {
            clearInterval(streamInterval!);
            streamInterval = null;
            setPhase("complete");
          }
        }, 28);
      }, 4200)
    );

    // Restart cycle after ~13s total
    timeouts.push(setTimeout(() => setCycleCount(c => c + 1), 13000));

    return () => {
      timeouts.forEach(clearTimeout);
      if (streamInterval) clearInterval(streamInterval);
    };
  }, [cycleCount]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b px-4 py-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
          style={{ backgroundColor: orange }}
        >
          AI
        </div>
        <div>
          <p className="text-xs font-bold leading-none">Fasiti AI Tutor</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Explains the questions you got wrong
          </p>
        </div>
      </div>

      {/* Message area */}
      <div className="flex min-h-[172px] flex-col justify-end gap-3 p-4">
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div
              key="user-msg"
              initial={{ opacity: 0, x: 16, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="flex justify-end"
            >
              <div
                className="max-w-[78%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed text-white"
                style={{ backgroundColor: orange }}
              >
                {USER_MSG}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {phase === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, x: -16, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.55,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaming AI response */}
        <AnimatePresence>
          {(phase === "streaming" || phase === "complete") && (
            <motion.div
              key="ai-response"
              initial={{ opacity: 0, x: -16, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="max-w-[78%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-xs leading-relaxed text-foreground"
            >
              {displayedResponse}
              {phase === "streaming" && (
                <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-foreground/60 align-middle" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2">
          <span className="flex-1 text-xs text-muted-foreground">
            Ask a follow-up question
          </span>
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: orange }}
          >
            <ArrowRight className="h-3 w-3" />
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

export const LeaderboardDemo = () => {
  const [cycleCount, setCycleCount] = useState(0);
  const [youScore, setYouScore] = useState(YOU_SCORES[0]);
  const [scoreStep, setScoreStep] = useState(0);

  useEffect(() => {
    setYouScore(YOU_SCORES[0]);
    setScoreStep(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    YOU_SCORES.slice(1).forEach((score, i) => {
      timeouts.push(
        setTimeout(() => {
          setYouScore(score);
          setScoreStep(i + 1);
        }, (i + 1) * 2500)
      );
    });

    timeouts.push(setTimeout(() => setCycleCount(c => c + 1), 16000));

    return () => timeouts.forEach(clearTimeout);
  }, [cycleCount]);

  const players = BASE_PLAYERS.map(p =>
    p.id === "you" ? { ...p, score: youScore } : p
  ).sort((a, b) => b.score - a.score);

  const rankStyle = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#94a3b8";
    if (rank === 3) return "#cd7f32";
    return undefined;
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Trophy className="h-4 w-4" style={{ color: orange }} />
        <p className="text-xs font-bold">National Leaderboard</p>
        <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          This week
        </span>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5 p-3">
        {players.map((player, i) => {
          const rank = i + 1;
          const isYou = player.id === "you";
          const color = rankStyle(rank);
          return (
            <motion.div
              key={player.id}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={
                isYou
                  ? {
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: orange,
                      backgroundColor: "hsl(25 95% 53% / 0.1)",
                    }
                  : { backgroundColor: "hsl(var(--muted) / 0.5)" }
              }
            >
              <span
                className="w-6 shrink-0 text-center text-xs font-black"
                style={{ color: color ?? "hsl(var(--muted-foreground))" }}
              >
                #{rank}
              </span>
              <span
                className={`flex-1 text-xs font-semibold ${
                  isYou ? "" : "text-muted-foreground"
                }`}
              >
                {player.name}
              </span>
              <motion.span
                key={`${player.id}-${player.score}`}
                initial={{ scale: isYou && scoreStep > 0 ? 1.3 : 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35 }}
                className="font-mono text-xs font-bold"
                style={{ color: isYou ? orange : "hsl(var(--muted-foreground))" }}
              >
                {player.score}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer status */}
      <div className="border-t px-4 py-2.5 text-center">
        <motion.span
          key={scoreStep}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-muted-foreground"
        >
          {scoreStep === 0
            ? "Finish tests to climb the ranks"
            : scoreStep < 4
            ? `Up ${scoreStep} place${scoreStep > 1 ? "s" : ""} this week`
            : "#1 this week"}
        </motion.span>
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
  <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
    {/* Header */}
    <div className="flex items-center gap-2 border-b px-4 py-3">
      <p className="text-xs font-bold">Topics to study next</p>
    </div>

    {/* Cards */}
    <div className="flex flex-col gap-2 p-3">
      {RECS.map(({ topic, subject, pct }) => {
        return (
          <div key={topic} className="rounded-xl border bg-secondary/40 p-3">
            <p className="mb-1 text-xs font-bold leading-tight">{topic}</p>
            <p className="mb-2 text-[10px] text-muted-foreground">
              {subject} · {pct}% proficiency
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: orange }}
                />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: orange }}
              >
                See resources
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
