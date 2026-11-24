import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Grid3x3, X } from "lucide-react";
import { useThemePreference } from "@/core/theme/useThemePreference";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import { blankCount, firstBlankIndex, isAnswered, subjectBlocks } from "../../service/testScreenService";
import type { FinishState, SubjectBlock, TestScreenAnswers, TestScreenQuestion } from "../../types/testScreenTypes";
import QuestionNumbers from "./QuestionNumbers";
import QuestionView from "./QuestionView";
import TestClock from "./TestClock";
import { BUTTON, FinishDialog, ICON_BUTTON, LeaveDialog, Sheet } from "./dialogs";

/**
 * The test screen, shared by practice tests and the daily challenge (design approved
 * 2026-11-24): one quiet top bar (leave, title, clock, Submit), subject tabs with progress,
 * the question with A to D letter rows, its subject's numbers beside it on a computer and in
 * a sheet on a phone, back and next in a bottom bar on a phone. Keys: A to D answer, N or the
 * right arrow next, P or the left arrow back. In the last five minutes it says how many are
 * blank. Follows the candidate's theme.
 */

export interface TestScreenProps {
  title: string;
  /** Grouped by subject (groupBySubject). */
  questions: TestScreenQuestion[];
  answers: TestScreenAnswers;
  current: number;
  onAnswer: (questionId: string, optionId: string) => void;
  onGo: (index: number) => void;
  /** Practice only: when the clock ends. */
  clock?: { endTime: number; onTimeUp: () => void };
  /** The clock ran out: answers can't change. */
  timeUp?: boolean;
  verb: "Submit" | "Finish";
  finishOpen: boolean;
  onFinishOpenChange: (open: boolean) => void;
  finishState: FinishState;
  finishError?: string | null;
  onConfirmFinish: () => void;
  /** What leaving means for this test, in one or two true sentences. */
  leaveBody: string;
  onLeave: () => void | Promise<void>;
  /** Short notes under the top bar (full screen off, a save that failed). */
  notices?: ReactNode;
}

const TestScreen = (props: TestScreenProps) => {
  const { questions, answers, current, onGo, timeUp = false } = props;
  const { theme } = useThemePreference();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  const [gridOpen, setGridOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [lateNote, setLateNote] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const subjects = useMemo(() => subjectBlocks(questions), [questions]);
  const q = questions[current];
  const subject = subjects.find((s) => current >= s.start && current < s.start + s.count) ?? subjects[0];
  const answeredIn = (s: SubjectBlock) => questions.slice(s.start, s.start + s.count).filter((x) => isAnswered(answers, x.id)).length;
  const firstBlankIn = (s: SubjectBlock) => {
    const i = firstBlankIndex(questions.slice(s.start, s.start + s.count), answers);
    return i === null ? null : s.start + i;
  };
  const blanks = blankCount(questions, answers);
  const firstBlank = firstBlankIndex(questions, answers);

  const go = (i: number) => {
    if (i < 0 || i >= questions.length) return;
    moved.current = true;
    setGridOpen(false);
    props.onFinishOpenChange(false);
    onGo(i);
  };
  // After moving, start reading at the new question
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [current]);

  // The last five minutes, from the clock's own end time
  useEffect(() => {
    if (!props.clock) return;
    const check = () => setLateNote(props.clock !== undefined && props.clock.endTime - Date.now() <= 300_000);
    check();
    const t = window.setInterval(check, 5000);
    return () => window.clearInterval(t);
  }, [props.clock]);

  // Keys, like the exam: A to D answer, N / right arrow next, P / left arrow back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gridOpen || leaveOpen || props.finishOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true], summary")) return;
      const key = e.key.toLowerCase();
      const option = q?.options.find((o) => o.label.toLowerCase() === key);
      if (option && !timeUp) props.onAnswer(q.id, option.id);
      else if (key === "n" || key === "arrowright") go(current + 1);
      else if (key === "p" || key === "arrowleft") go(current - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!q || !subject) return null;
  const numberInSubject = current - subject.start + 1;

  const leave = async () => {
    setLeaving(true);
    try {
      await props.onLeave();
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="fasiti-theme flex min-h-dvh flex-col bg-card text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-2 sm:gap-3 sm:px-6">
          <button type="button" onClick={() => setLeaveOpen(true)} aria-label="Leave the test" className={ICON_BUTTON}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="min-w-0 flex-1 truncate font-bold">{props.title}</p>
          {props.clock && <TestClock endTime={props.clock.endTime} onTimeUp={props.clock.onTimeUp} />}
          <button type="button" onClick={() => props.onFinishOpenChange(true)} className={cn(BUTTON, PRESSABLE, SECONDARY_ACTION, FOCUS_RING, "ml-1 sm:ml-2")}>
            {props.verb}
          </button>
        </div>
      </header>

      {props.notices}
      {lateNote && !timeUp && (
        <div className="border-b bg-brand-orange/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
            <p className="text-sm">
              <span className="font-bold">Under 5 minutes left.</span> {blanks > 0 ? `${blanks} still blank. A guess can only gain marks.` : "Every question is answered."}
            </p>
            {firstBlank !== null && firstBlank !== current && (
              <button type="button" onClick={() => go(firstBlank)} className={cn(BUTTON, "min-h-9 px-2 text-brand-text hover:bg-muted", FOCUS_RING)}>
                Go to first blank
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:pb-12">
        {subjects.length > 1 && (
          <nav aria-label="Subjects" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-1 border-b">
              {subjects.map((s) => {
                const active = s.name === subject.name;
                return (
                  <li key={s.name}>
                    <button
                      type="button"
                      onClick={() => go(firstBlankIn(s) ?? s.start)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative flex min-h-11 items-center gap-2 rounded-t-lg px-3 text-sm",
                        active ? "font-bold text-foreground" : "text-muted-foreground hover:text-foreground",
                        FOCUS_RING,
                      )}
                    >
                      {s.name}
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        <span className="sr-only">, answered </span>
                        {answeredIn(s)}/{s.count}
                      </span>
                      {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-orange" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
          <main id="main-content" className="min-w-0">
            <QuestionView
              question={q}
              number={numberInSubject}
              of={subject.count}
              subject={subject.name}
              headingRef={headingRef}
              selected={props.answers[q.id]}
              disabled={timeUp}
              onSelect={(optionId) => props.onAnswer(q.id, optionId)}
            />

            {/* Back and next: in the page on a computer, a bar at the bottom on a phone */}
            <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t bg-card px-4 py-3 lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0">
              <button type="button" onClick={() => go(current - 1)} disabled={current === 0} className={cn(BUTTON, PRESSABLE, SECONDARY_ACTION, FOCUS_RING)}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="max-sm:sr-only">Back</span>
              </button>
              <button type="button" onClick={() => setGridOpen(true)} className={cn(BUTTON, "flex-1 text-muted-foreground hover:bg-muted lg:hidden", FOCUS_RING)}>
                <Grid3x3 className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">
                  {numberInSubject} of {subject.count}
                </span>
                <span className="sr-only">, show {subject.name} questions</span>
              </button>
              <span className="hidden flex-1 lg:block" />
              <button
                type="button"
                onClick={() => go(current + 1)}
                disabled={current === questions.length - 1}
                className={cn(BUTTON, PRESSABLE, PRIMARY_ACTION, FOCUS_RING, "px-6")}
              >
                Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-6 hidden text-xs text-muted-foreground lg:block">Keys: A to D to answer, N for next, P for back.</p>
          </main>

          <aside aria-label={`${subject.name} questions`} className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-sm font-bold">{subject.name}</p>
              <QuestionNumbers questions={questions} subject={subject} current={current} answers={answers} onGo={go} columns="grid-cols-6" />
            </div>
          </aside>
        </div>
      </div>

      <Sheet open={gridOpen} onOpenChange={setGridOpen} title={`${subject.name} questions`}>
        <QuestionNumbers questions={questions} subject={subject} current={current} answers={answers} onGo={go} columns="grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))]" />
      </Sheet>
      <FinishDialog
        open={props.finishOpen}
        onOpenChange={props.onFinishOpenChange}
        verb={props.verb}
        state={props.finishState}
        error={props.finishError}
        timeUp={timeUp}
        subjects={subjects}
        answeredIn={answeredIn}
        firstBlankIn={firstBlankIn}
        onGo={go}
        onConfirm={props.onConfirmFinish}
      />
      <LeaveDialog open={leaveOpen} onOpenChange={setLeaveOpen} body={props.leaveBody} leaving={leaving} onLeave={() => void leave()} />
    </div>
  );
};

export const Notice = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="border-b bg-muted/70">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
      <p className="text-sm">{children}</p>
      {action}
    </div>
  </div>
);

export const NOTICE_ACTION = cn(BUTTON, "min-h-9 px-2 text-brand-text hover:bg-muted", FOCUS_RING);

export default TestScreen;
