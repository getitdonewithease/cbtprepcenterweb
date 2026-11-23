import { useId, useState } from "react";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/ui/cn";
import {
  CLOSE_TARGET,
  FOCUS_RING,
  OVERLAY_MOTION,
  PRESSABLE,
  PRIMARY_ACTION,
} from "@/core/ui/styles";
import { PrepareTestPayload, PracticeTestType } from "../types/dashboardTypes";

const MAX_SUBJECTS = 4;
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 180;
const DEFAULT_QUESTIONS = 10;

const TAB_CLASS = cn(
  "-mb-px min-h-11 min-w-11 rounded-none border-b-2 border-transparent bg-transparent px-2 font-semibold text-muted-foreground transition-colors ease-soft-out duration-200",
  "data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
  FOCUS_RING,
);

const SUBMIT_CLASS = cn(
  "inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold",
  "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
  PRESSABLE,
  PRIMARY_ACTION,
  FOCUS_RING,
);

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

const displayDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const parts = [
    h > 0 ? `${h} ${h === 1 ? "hour" : "hours"}` : null,
    m > 0 ? `${m} ${m === 1 ? "minute" : "minutes"}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "0 minutes";
};

const standardCourses = (subjects: string[]) =>
  Object.fromEntries(
    subjects.map((subject) => {
      const key = subject.toLowerCase();
      return [key, key === "english" ? 60 : 40];
    }),
  );

interface NewTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onStart?: (opts: PrepareTestPayload) => void;
  subjects?: string[];
}

export default function NewTestDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  onStart,
  subjects = [],
}: NewTestDialogProps) {
  const id = useId();
  // One entry per selected subject; null while its field is empty
  const [questionCounts, setQuestionCounts] = useState<Record<string, number | null>>({});
  const [durationMinutes, setDurationMinutes] = useState(60);

  const selectedSubjects = Object.keys(questionCounts);
  const isValidCount = (count: number | null) =>
    count !== null && Number.isInteger(count) && count >= MIN_QUESTIONS && count <= MAX_QUESTIONS;

  const customProblem =
    selectedSubjects.length === 0
      ? "Pick at least one subject."
      : Object.values(questionCounts).every(isValidCount)
        ? null
        : `Use ${MIN_QUESTIONS} to ${MAX_QUESTIONS} questions for each subject.`;

  const standardProblem =
    subjects.length === MAX_SUBJECTS
      ? null
      : "A standard test needs 4 subjects. Choose yours in Settings.";

  const toggleSubject = (subject: string) => {
    setQuestionCounts((previous) => {
      if (!(subject in previous)) return { ...previous, [subject]: DEFAULT_QUESTIONS };
      const { [subject]: _removed, ...rest } = previous;
      return rest;
    });
  };

  const start = (options: PrepareTestPayload) => {
    onOpenChange(false);
    onStart?.(options);
  };

  const startCustom = () =>
    start({
      duration: formatDuration(durationMinutes),
      courses: Object.fromEntries(
        Object.entries(questionCounts).map(([subject, count]) => [
          subject.toLowerCase(),
          count ?? DEFAULT_QUESTIONS,
        ]),
      ),
      practiceTestType: PracticeTestType.Custom,
    });

  const startStandard = () =>
    start({
      duration: "02:00:00",
      courses: standardCourses(subjects),
      practiceTestType: PracticeTestType.Standard,
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Four subjects make this taller than a small phone, so it scrolls
        className={cn(
          "fasiti-theme block max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg overflow-y-auto overflow-x-hidden rounded-2xl bg-card px-4 text-foreground sm:rounded-2xl sm:px-6",
          OVERLAY_MOTION,
        )}
        closeClassName={CLOSE_TARGET}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogTitle className="pr-8 text-lg font-bold">New Test</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a custom or standard practice test.
        </DialogDescription>

        <Tabs defaultValue="custom" className="mt-3">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="custom" className={TAB_CLASS}>
              Custom
            </TabsTrigger>
            <TabsTrigger value="standard" className={TAB_CLASS}>
              Standard
            </TabsTrigger>
            <TabsTrigger value="mock" disabled className={TAB_CLASS}>
              Mock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="mt-5">
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p id={`${id}-duration`} className="text-sm font-semibold">
                    Duration
                  </p>
                  <p className="text-lg font-bold tabular-nums">{displayDuration(durationMinutes)}</p>
                </div>
                <Slider
                  className="h-11"
                  thumbProps={{
                    "aria-labelledby": `${id}-duration`,
                    "aria-valuetext": displayDuration(durationMinutes),
                  }}
                  min={5}
                  max={120}
                  step={1}
                  value={[durationMinutes]}
                  onValueChange={(value) => setDurationMinutes(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
                  <span>5 min</span>
                  <span>2 hr</span>
                </div>
              </div>

              <fieldset className="min-w-0">
                <legend className="mb-2 text-sm font-semibold">
                  Subjects <span className="font-normal text-muted-foreground">(up to 4)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => {
                    const selected = subject in questionCounts;
                    return (
                      <button
                        key={subject}
                        type="button"
                        aria-pressed={selected}
                        disabled={!selected && selectedSubjects.length >= MAX_SUBJECTS}
                        onClick={() => toggleSubject(subject)}
                        className={cn(
                          "inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-xl border px-3 text-sm capitalize disabled:opacity-50",
                          PRESSABLE,
                          FOCUS_RING,
                          selected
                            ? "border-brand-orange bg-brand-orange/10 font-semibold text-foreground"
                            : "border-muted-foreground/60 text-muted-foreground hover:bg-muted active:bg-border",
                        )}
                      >
                        {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {selectedSubjects.length > 0 && (
                <fieldset className="min-w-0">
                  <legend className="mb-2 text-sm font-semibold">
                    Questions per subject{" "}
                    <span className="font-normal text-muted-foreground">
                      ({MIN_QUESTIONS} to {MAX_QUESTIONS})
                    </span>
                  </legend>
                  <div className="space-y-2">
                    {selectedSubjects.map((subject, index) => {
                      const count = questionCounts[subject];
                      const isValid = isValidCount(count);
                      return (
                        <div key={subject} className="flex flex-wrap items-center justify-between gap-x-4">
                          <label htmlFor={`${id}-count-${index}`} className="text-sm capitalize">
                            {subject}
                          </label>
                          <Input
                            id={`${id}-count-${index}`}
                            type="number"
                            inputMode="numeric"
                            min={MIN_QUESTIONS}
                            max={MAX_QUESTIONS}
                            step={1}
                            aria-invalid={!isValid}
                            aria-describedby={isValid ? undefined : `${id}-custom-problem`}
                            value={count ?? ""}
                            onChange={(event) => {
                              const { value } = event.target;
                              setQuestionCounts((previous) => ({
                                ...previous,
                                [subject]: value === "" ? null : Number(value),
                              }));
                            }}
                            className={cn(
                              "h-11 w-24 rounded-xl border-muted-foreground/60 text-base tabular-nums",
                              "aria-[invalid=true]:border-destructive",
                              FOCUS_RING,
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <div>
                <p
                  id={`${id}-custom-problem`}
                  aria-live="polite"
                  className={cn("text-sm text-muted-foreground", customProblem && "mb-2")}
                >
                  {customProblem}
                </p>
                <button
                  type="button"
                  className={SUBMIT_CLASS}
                  disabled={customProblem !== null}
                  onClick={startCustom}
                >
                  Prepare Questions
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="standard" className="mt-5">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold">Subjects</p>
                <ul className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <li key={subject} className="rounded-xl bg-muted px-3 py-2 text-sm capitalize">
                      {subject}
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="flex flex-wrap gap-x-12 gap-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Duration</dt>
                  <dd className="text-base font-semibold tabular-nums">2 hours</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Questions</dt>
                  <dd className="text-base font-semibold tabular-nums">180</dd>
                </div>
              </dl>

              <p className="text-pretty text-sm text-muted-foreground">
                A countdown timer shows during the test.
              </p>

              <div>
                {standardProblem && (
                  <p className="mb-2 text-sm text-muted-foreground">{standardProblem}</p>
                )}
                <button
                  type="button"
                  className={SUBMIT_CLASS}
                  disabled={standardProblem !== null}
                  onClick={startStandard}
                >
                  Prepare Questions
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
