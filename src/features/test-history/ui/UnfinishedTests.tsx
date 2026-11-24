import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/core/ui/cn";
import { kindOf, subjectsOf, unfinishedOf } from "../services/testHistoryService";
import type { TestRecord } from "../types/testHistoryTypes";
import { SECTION, SectionHeading, formatTimeUsed, primaryButton, quietButton, whenSetUp } from "./historyParts";

/**
 * Tests started and not finished, at the top. One main button on the page: Continue on
 * the test under way. Anything else is a text link; Cancel asks first, inline.
 */

const progressLine = (test: TestRecord) => {
  if (test.status === "not-started") return `Set up ${whenSetUp(test.createdOn)}, not started`;
  const used = formatTimeUsed(test.secondsUsed);
  return `Started ${whenSetUp(test.createdOn)} · ${test.numberOfAttempted} of ${test.numberOfQuestions} answered${used ? ` · ${used} used` : ""}`;
};

const UnfinishedRow = ({ test, lead, onCancel }: { test: TestRecord; lead: boolean; onCancel: (id: string) => Promise<void> }) => {
  const [step, setStep] = useState<"idle" | "confirm" | "cancelling" | "failed">("idle");
  const action = test.status === "not-started" ? "Start" : "Continue";

  const cancel = async () => {
    setStep("cancelling");
    try {
      await onCancel(test.id);
    } catch {
      setStep("failed");
    }
  };

  return (
    <li className="flex flex-col gap-3 border-t py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold">
          {kindOf(test)}
          <span className="font-normal text-muted-foreground"> · {subjectsOf(test)}</span>
        </p>
        <p className="text-sm text-muted-foreground">{progressLine(test)}</p>
        {step === "failed" && (
          <p role="alert" className="mt-1 text-sm font-semibold text-destructive">
            We couldn't cancel it. Check your connection and try again.
          </p>
        )}
      </div>
      {step === "confirm" || step === "cancelling" ? (
        <div role="group" aria-label="Cancel this test?" className="flex flex-wrap items-center gap-1">
          <span className="text-sm font-semibold">Cancel it? You can't continue it later.</span>
          <button
            type="button"
            onClick={cancel}
            disabled={step === "cancelling"}
            className={cn(quietButton(), "text-destructive hover:text-destructive")}
          >
            {step === "cancelling" ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button type="button" onClick={() => setStep("idle")} disabled={step === "cancelling"} className={quietButton()}>
            Keep it
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Link
            to={`/practice/summary/${test.id}`}
            className={lead ? primaryButton() : cn(quietButton(), "text-brand-text hover:text-brand-text")}
          >
            {action}
          </Link>
          <button type="button" onClick={() => setStep("confirm")} className={quietButton()}>
            Cancel
          </button>
        </div>
      )}
    </li>
  );
};

const UnfinishedTests = ({ tests, onCancel }: { tests: TestRecord[]; onCancel: (id: string) => Promise<void> }) => {
  const open = unfinishedOf(tests);
  if (open.length === 0) return null;
  return (
    <section aria-labelledby="unfinished-heading" className={SECTION}>
      <SectionHeading id="unfinished-heading">Pick up where you left off</SectionHeading>
      <ul className="mt-2">
        {open.map((test, i) => (
          <UnfinishedRow key={test.id} test={test} lead={i === 0} onCancel={onCancel} />
        ))}
      </ul>
    </section>
  );
};

export default UnfinishedTests;
