import React, { useState, useEffect, useRef, useMemo } from "react";
import "./StreakSurgeModal.css";

interface StreakSurgeModalProps {
  isOpen: boolean;
  currentStreakCount: number;
  onClose?: () => void;
}

interface EmberData {
  id: number;
  s: string;
  x: string;
  y: string;
  t: string;
  d: string;
  isBurst?: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const StreakSurgeModal: React.FC<StreakSurgeModalProps> = ({
  isOpen,
  currentStreakCount,
  onClose,
}) => {

  const [isSurge, setIsSurge] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [burstEmbers, setBurstEmbers] = useState<EmberData[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const prevCount = Math.max(0, currentStreakCount - 1);
  const nextTarget = currentStreakCount + 1;

  // Build dynamic row up to max 7 days based on currentStreakCount
  const weekDays = useMemo(() => {
    const names = ["S", "M", "T", "W", "T", "F", "S"];
    const now = new Date();
    const days: { dayName: string; isToday: boolean }[] = [];

    // If streak is 1: only show today [M]
    // If streak is 2: show [S, M]
    // If streak is 3: show [S, S, M]
    // If streak is 4: show [F, S, S, M] ... max 7 days
    const count = Math.min(7, Math.max(1, currentStreakCount));

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push({
        dayName: names[d.getDay()],
        isToday: i === 0,
      });
    }
    return days;
  }, [currentStreakCount]);

  // Idle embers
  const idleEmbers: EmberData[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      s: `${rand(3, 5.5).toFixed(1)}px`,
      x: `${rand(-34, 34).toFixed(0)}px`,
      y: `${(-rand(90, 150)).toFixed(0)}px`,
      t: `${rand(2.2, 3.4).toFixed(2)}s`,
      d: `${rand(0, 2.6).toFixed(2)}s`,
    }));
  }, []);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      setIsSurge(false);
      setIsPop(false);
      setLiveText("");
      setBurstEmbers([]);
      return;
    }

    clearAllTimers();
    setIsSurge(false);
    setIsPop(false);
    setLiveText("");

    // Trigger surge at 1000ms
    const t1 = setTimeout(() => {
      setIsSurge(true);

      // Generate burst embers
      const newBurst: EmberData[] = Array.from({ length: 26 }, (_, i) => ({
        id: Date.now() + i,
        s: `${rand(3, 7).toFixed(1)}px`,
        x: `${rand(-90, 90).toFixed(0)}px`,
        y: `${(-rand(80, 190)).toFixed(0)}px`,
        t: `${rand(1.1, 2).toFixed(2)}s`,
        d: `${rand(0, 0.25).toFixed(2)}s`,
        isBurst: true,
      }));
      setBurstEmbers(newBurst);
    }, 1000);

    // Trigger pop and screen reader announcement at 1500ms
    const t2 = setTimeout(() => {
      setIsPop(true);
      setLiveText(`Streak extended to ${currentStreakCount} days`);
    }, 1500);

    timersRef.current = [t1, t2];

    return () => {
      clearAllTimers();
    };
  }, [isOpen, currentStreakCount]);

  const handleContinue = () => {
    clearAllTimers();
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && isSurge) {
        handleContinue();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSurge]);

  if (!isOpen) return null;

  return (
    <div
      className={`streak-surge-overlay open ${isSurge ? "streak-surge" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dlg-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && isSurge) {
          handleContinue();
        }
      }}
    >
      <div className="streak-surge-dialog">
        {/* Animated Fire Stage */}
        <div className="streak-fire-stage">
          <div className="streak-glow" />
          <div className="streak-ring" />
          <div className="streak-flame-wrap">
            <svg className="streak-flame" viewBox="0 0 120 160" aria-hidden="true">
              <defs>
                <linearGradient id="streakGOuter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ff3d2e" />
                  <stop offset="0.5" stopColor="#ff6a1a" />
                  <stop offset="1" stopColor="#ff9d1c" />
                </linearGradient>
                <linearGradient id="streakGMid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ff9420" />
                  <stop offset="1" stopColor="#ffd34d" />
                </linearGradient>
                <linearGradient id="streakGInner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff0a6" />
                  <stop offset="1" stopColor="#fffbe6" />
                </linearGradient>
              </defs>
              <path
                className="streak-layer streak-l-outer"
                fill="url(#streakGOuter)"
                d="M60 4 C62 30 92 44 100 82 C108 118 88 152 60 154 C32 152 12 118 20 84 C24 66 36 56 40 40 C48 48 50 58 50 66 C56 50 58 28 60 4 Z"
              />
              <path
                className="streak-layer streak-l-mid"
                fill="url(#streakGMid)"
                d="M60 44 C62 64 82 76 86 102 C90 126 76 146 60 148 C44 146 30 126 34 104 C36 92 44 86 48 76 C52 84 54 90 56 96 C58 78 60 62 60 44 Z"
              />
              <path
                className="streak-layer streak-l-inner"
                fill="url(#streakGInner)"
                d="M60 88 C62 100 74 108 74 124 C74 138 68 146 60 146 C52 146 46 138 46 124 C46 112 56 104 60 88 Z"
              />
            </svg>
          </div>

          {/* Embers */}
          <div className="streak-embers">
            {idleEmbers.map((e) => (
              <span
                key={e.id}
                className="streak-ember"
                style={
                  {
                    "--s": e.s,
                    "--x": e.x,
                    "--y": e.y,
                    "--t": e.t,
                    "--d": e.d,
                  } as React.CSSProperties
                }
              />
            ))}
            {burstEmbers.map((e) => (
              <span
                key={e.id}
                className="streak-ember burst"
                style={
                  {
                    "--s": e.s,
                    "--x": e.x,
                    "--y": e.y,
                    "--t": e.t,
                    "--d": e.d,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>

        {/* Rolling Counter */}
        <div className={`streak-count-wrap ${isPop ? "pop" : ""}`}>
          <div className="streak-count" aria-hidden="true">
            <span className="streak-roll">
              <span className="streak-col">
                <span>{prevCount}</span>
                <span>{currentStreakCount}</span>
              </span>
            </span>
          </div>
          <div className="streak-unit">day streak</div>
        </div>

        <span className="streak-vh" aria-live="polite">
          {liveText}
        </span>

        {/* Title & Subtitle Swapping */}
        <h2 className="streak-title streak-swap" id="dlg-title">
          <span className="before">Adding today</span>
          <span className="after">Streak extended</span>
        </h2>

        <p className="streak-sub streak-swap">
          <span className="before">Counting your submission.</span>
          <span className="after">Come back tomorrow to make it {nextTarget}.</span>
        </p>

        {/* Week Row */}
        <ul className="streak-week">
          {weekDays.map((w, idx) => (
            <li key={idx}>
              <span className={`streak-dot ${w.isToday ? "today" : ""}`}>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 8.5l3 3 6-7" />
                </svg>
              </span>
              <span>{w.dayName}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <div className="streak-actions">
          <button
            type="button"
            className="streak-btn"
            style={{
              background: "linear-gradient(180deg, #ff7a1c 0%, #ff5213 100%)",
              color: "#ffffff",
              borderRadius: "9999px",
            }}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakSurgeModal;
