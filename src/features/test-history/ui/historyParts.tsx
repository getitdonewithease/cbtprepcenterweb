import type { ReactNode } from "react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";

/** Shared pieces of the test history (design approved 2026-11-24; MASTER.md tokens only). */

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50";

export const primaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, PRIMARY_ACTION, FOCUS_RING, extra);
export const secondaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, SECONDARY_ACTION, FOCUS_RING, extra);
export const quietButton = (extra?: string) =>
  cn(BUTTON_BASE, "px-3 text-muted-foreground hover:bg-muted hover:text-foreground", PRESSABLE, FOCUS_RING, extra);

/** Each section: vertical rhythm, a hairline to the next. */
export const SECTION = "border-b py-8 last:border-b-0 sm:py-10";

export const SectionHeading = ({ id, children, aside }: { id: string; children: ReactNode; aside?: ReactNode }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
    <h2 id={id} className="text-xl font-extrabold tracking-[-0.02em]">
      {children}
    </h2>
    {aside}
  </div>
);

export const formatDay = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
export const formatClock = (iso: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

export const formatTimeUsed = (seconds: number) => {
  if (seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min`;
  return `${seconds} s`;
};

/** "today, 09:00" or "23 Nov, 14:00", in the candidate's own time zone. */
export const whenSetUp = (iso: string) => {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return `${sameDay ? "today" : formatDay(iso)}, ${formatClock(iso)}`;
};
