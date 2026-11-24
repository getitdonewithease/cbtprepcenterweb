import { Fragment, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING } from "@/core/ui/styles";
import {
  filterTests,
  isFullTest,
  kindOf,
  resultOf,
  subjectsInHistory,
  subjectsOf,
  type KindFilter,
} from "../services/testHistoryService";
import type { TestRecord } from "../types/testHistoryTypes";
import { SECTION, SectionHeading, formatClock, formatDay, formatTimeUsed, secondaryButton } from "./historyParts";

/**
 * Every finished and cancelled test. Two controls narrow it (kind, subject), over all
 * tests. A table on desktop, rows on a phone; a finished test opens in place with its
 * subjects and one button to its review. Ten at a time.
 */

const PAGE = 10;

const KINDS: Array<{ value: KindFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "full", label: "Full tests" },
  { value: "practice", label: "Practice" },
];

const Breakdown = ({ test }: { test: TestRecord }) => {
  const used = formatTimeUsed(test.secondsUsed);
  return (
    <div className="pb-4 pt-1">
      <ul className="max-w-xl">
        {test.subjects.map((s) => (
          <li key={s.name} className="grid grid-cols-[8rem_minmax(0,1fr)_3rem] items-center gap-3 py-1.5 text-sm">
            <span className="truncate font-semibold">{s.name}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span className="block h-full rounded-full bg-brand-orange" style={{ width: `${Math.min(100, Math.max(0, s.percentage))}%` }} />
            </span>
            <span className="text-right tabular-nums text-muted-foreground">{Math.round(s.percentage)}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-muted-foreground">
        {test.numberOfCorrect} of {test.numberOfQuestions} right{used ? ` · ${used}` : ""}
      </p>
      <Link to={`/practice/review/${test.id}`} className={secondaryButton("mt-3")}>
        Review the answers
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
};

const rowName = (test: TestRecord) => `${kindOf(test)} of ${formatDay(test.createdOn)}`;

/** Phones: one row per test; a finished one opens in place. */
const PhoneRow = ({ test, open, onToggle }: { test: TestRecord; open: boolean; onToggle: () => void }) => {
  const finished = test.status === "submitted";
  const used = formatTimeUsed(test.secondsUsed);
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">
          {kindOf(test)}
          <span className="font-normal text-muted-foreground">
            , {formatDay(test.createdOn)} {formatClock(test.createdOn)}
          </span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {subjectsOf(test)}
          {used ? ` · ${used}` : ""}
        </span>
      </span>
      {finished ? (
        <span className="shrink-0 text-right">
          <span className="block text-sm font-extrabold tabular-nums">{resultOf(test)}</span>
          {!isFullTest(test) && (
            <span className="block text-xs tabular-nums text-muted-foreground">
              {test.numberOfCorrect} of {test.numberOfQuestions}
            </span>
          )}
        </span>
      ) : (
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">Cancelled</span>
      )}
    </>
  );
  const rowClass = "-mx-2 flex min-h-16 w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2 text-left";
  return (
    <li className="border-t first:border-t-0">
      {finished ? (
        <>
          <button type="button" aria-expanded={open} onClick={onToggle} className={cn(rowClass, "hover:bg-muted", FOCUS_RING)}>
            {body}
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
          </button>
          {open && <Breakdown test={test} />}
        </>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
};

const AllTests = ({ tests }: { tests: TestRecord[] }) => {
  const [kind, setKind] = useState<KindFilter>("all");
  const [subject, setSubject] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const subjectId = useId();

  const subjects = subjectsInHistory(tests);
  const listed = filterTests(tests, kind, subject);
  const page = listed.slice(0, shown);
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));
  const narrow = (next: () => void) => {
    next();
    setShown(PAGE);
    setOpenId(null);
  };

  const cell = "border-t px-3 py-3 align-middle first:pl-0 last:pr-0";

  return (
    <section aria-labelledby="all-heading" className={SECTION}>
      <SectionHeading id="all-heading">All tests</SectionHeading>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Kind of test" className="inline-flex rounded-xl bg-muted p-1 text-sm font-semibold">
          {KINDS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={kind === option.value}
              onClick={() => narrow(() => setKind(option.value))}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg px-3",
                kind === option.value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                FOCUS_RING,
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {subjects.length > 1 && (
          <>
            <label htmlFor={subjectId} className="sr-only">
              Subject
            </label>
            <select
              id={subjectId}
              value={subject}
              onChange={(event) => narrow(() => setSubject(event.target.value))}
              className={cn("h-11 rounded-xl border bg-card px-3 text-sm font-semibold", FOCUS_RING)}
            >
              <option value="all">Every subject</option>
              {subjects.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {listed.length} {listed.length === 1 ? "test" : "tests"}
      </p>

      {listed.length === 0 ? (
        <p className="mt-2 text-muted-foreground">No tests match. Try another kind or subject.</p>
      ) : (
        <>
          <ul className="mt-2 lg:hidden">
            {page.map((test) => (
              <PhoneRow key={test.id} test={test} open={openId === test.id} onToggle={() => toggle(test.id)} />
            ))}
          </ul>

          <table className="mt-2 hidden w-full text-sm lg:table">
            <caption className="sr-only">Your finished and cancelled tests, newest first</caption>
            <thead>
              <tr className="text-left text-muted-foreground">
                <th scope="col" className="pb-2 pr-3 font-semibold">Date</th>
                <th scope="col" className="px-3 pb-2 font-semibold">Test</th>
                <th scope="col" className="px-3 pb-2 font-semibold">Subjects</th>
                <th scope="col" className="px-3 pb-2 text-right font-semibold">Result</th>
                <th scope="col" className="px-3 pb-2 text-right font-semibold">Time</th>
                <th scope="col" className="pb-2 pl-3">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {page.map((test) => {
                const finished = test.status === "submitted";
                const open = openId === test.id;
                return (
                  <Fragment key={test.id}>
                    {/* A finished row opens on a click anywhere; the chevron is its keyboard control */}
                    <tr
                      onClick={finished ? () => toggle(test.id) : undefined}
                      className={cn(finished && "cursor-pointer hover:bg-muted/50", open && "bg-muted/50")}
                    >
                      <td className={cn(cell, "whitespace-nowrap")}>
                        {formatDay(test.createdOn)} <span className="text-muted-foreground">{formatClock(test.createdOn)}</span>
                      </td>
                      <td className={cn(cell, "font-semibold")}>{kindOf(test)}</td>
                      <td className={cn(cell, "text-muted-foreground")}>{subjectsOf(test)}</td>
                      <td className={cn(cell, "text-right font-extrabold tabular-nums")}>
                        {finished ? resultOf(test) : <span className="font-semibold text-muted-foreground">Cancelled</span>}
                      </td>
                      <td className={cn(cell, "whitespace-nowrap text-right tabular-nums text-muted-foreground")}>
                        {formatTimeUsed(test.secondsUsed) ?? "–"}
                      </td>
                      <td className={cn(cell, "text-right")}>
                        {finished && (
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-label={`${open ? "Hide" : "Show"} the subjects of the ${rowName(test)}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggle(test.id);
                            }}
                            className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground", FOCUS_RING)}
                          >
                            <ChevronDown className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} className="pb-2">
                          <Breakdown test={test} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {listed.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className={secondaryButton("mt-6")}>
              Show {Math.min(PAGE, listed.length - shown)} more
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default AllTests;
