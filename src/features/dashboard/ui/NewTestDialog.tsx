import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { PrepareTestPayload, PracticeTestType } from "../types/dashboardTypes";

interface NewTestDialogProps {
  children: React.ReactNode;
  onStart?: (opts: PrepareTestPayload) => void;
  subjects?: string[];
}

const orange = "hsl(var(--brand-orange))";

export default function NewTestDialog({ children, onStart, subjects = [] }: NewTestDialogProps) {
  const [tab, setTab] = useState<"custom" | "standard">("custom");
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<{ [subject: string]: number }>({});
  const [open, setOpen] = useState(false);
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number>(60);

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

  const standardFields = { subjects, time: 120, questions: 180, showTimer: true };

  const handleSubjectToggle = (subject: string) => {
    setCustomSubjects((prev) => {
      if (prev.includes(subject)) {
        const updated = { ...customQuestions };
        delete updated[subject];
        setCustomQuestions(updated);
        return prev.filter((s) => s !== subject);
      } else if (prev.length < 4) {
        setCustomQuestions((q) => ({ ...q, [subject]: 10 }));
        return [...prev, subject];
      }
      return prev;
    });
  };

  const canStartCustom =
    customSubjects.length >= 1 &&
    customSubjects.every(
      (sub) => customQuestions[sub] && customQuestions[sub] >= 5 && customQuestions[sub] <= 180,
    );

  const tabs: Array<"custom" | "standard"> = ["custom", "standard"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogTitle className="sr-only">New Test</DialogTitle>

        {/* Header + tab bar */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-lg font-black">New Test</p>
        </div>

        {/* Underline tabs */}
        <div className="flex gap-5 border-b border-border mb-5">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="pb-2.5 text-sm font-medium capitalize transition-colors"
              style={
                tab === t
                  ? {
                      borderBottom: `2px solid ${orange}`,
                      color: "hsl(var(--foreground))",
                      marginBottom: "-1px",
                    }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            disabled
            className="pb-2.5 text-sm font-medium opacity-30 cursor-not-allowed"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Mock
          </button>
        </div>

        {/* Standard tab */}
        {tab === "standard" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                {standardFields.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="rounded-full border px-3 py-1.5 text-sm opacity-50 cursor-not-allowed"
                    style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Duration
                </p>
                <p className="text-base font-semibold">2 hours</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Questions
                </p>
                <p className="text-base font-semibold">180</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="show-timer-standard" checked disabled />
              <Label htmlFor="show-timer-standard" className="text-sm text-muted-foreground">
                Show countdown timer during the test
              </Label>
            </div>

            <Button
              className="w-full text-white"
              style={{ backgroundColor: orange }}
              onClick={() => {
                setOpen(false);
                onStart?.({
                  duration: "02:00:00",
                  courses: standardFields.subjects.reduce(
                    (acc, s) => {
                      const key = s.toLowerCase();
                      acc[key] = key === "english" ? 60 : 40;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                  practiceTestType: PracticeTestType.Standard,
                });
              }}
            >
              Prepare Questions
            </Button>
          </div>
        )}

        {/* Custom tab */}
        {tab === "custom" && (
          <div className="space-y-6">
            {/* Duration */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Duration
                </p>
                <span className="text-lg font-black tabular-nums">
                  {displayDuration(customDurationMinutes)}
                </span>
              </div>
              <Slider
                min={5}
                max={120}
                step={1}
                value={[customDurationMinutes]}
                onValueChange={(v) => setCustomDurationMinutes(v[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>5 min</span>
                <span>2 hr</span>
              </div>
            </div>

            {/* Subject selection */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Subjects{" "}
                <span className="font-normal normal-case tracking-normal">
                  (max 4)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(subjects || []).map((sub) => {
                  const selected = customSubjects.includes(sub);
                  const disabled = !selected && customSubjects.length >= 4;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubjectToggle(sub)}
                      disabled={disabled}
                      className="rounded-full border px-3 py-1.5 text-sm transition-all disabled:opacity-40"
                      style={
                        selected
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
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions per subject */}
            {customSubjects.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Questions per subject{" "}
                  <span className="font-normal normal-case tracking-normal">
                    (5–180)
                  </span>
                </p>
                <div className="space-y-3">
                  {customSubjects.map((sub) => (
                    <div key={sub} className="flex items-center gap-4">
                      <Label className="w-32 text-sm font-medium">{sub}</Label>
                      <Input
                        type="number"
                        min={5}
                        max={180}
                        step={1}
                        value={customQuestions[sub] || 10}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCustomQuestions((prev) => ({ ...prev, [sub]: value }));
                        }}
                        className="w-24 h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full text-white"
              style={{ backgroundColor: orange }}
              disabled={!canStartCustom}
              onClick={() => {
                setOpen(false);
                onStart?.({
                  duration: formatDuration(customDurationMinutes),
                  courses: customSubjects.reduce(
                    (acc, sub) => {
                      acc[sub.toLowerCase()] = customQuestions[sub] || 10;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                  practiceTestType: PracticeTestType.Custom,
                });
              }}
            >
              Prepare Questions
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
