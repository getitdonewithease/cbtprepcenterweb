import { useEffect, useRef, useState } from "react";
import { chartValueOf, finishedOldestFirst, isFullTest, outOf400, percentRight } from "../services/testHistoryService";
import type { TestRecord } from "../types/testHistoryTypes";
import { SECTION, SectionHeading, formatDay } from "./historyParts";

/**
 * Every finished test over time: full tests as a line against the 250 / 400 pace, practice
 * tests as rings. Drawn at the width it is shown at, so its labels stay 11px on a phone.
 * With fewer than two finished tests there is nothing to draw, so it says so in words.
 */

const H = 220;
const PAD = { left: 40, right: 16, top: 16, bottom: 28 };

const HistoryChart = ({ tests }: { tests: TestRecord[] }) => {
  const frameRef = useRef<HTMLElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(280, Math.min(768, Math.round(entry.contentRect.width)))));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const finished = finishedOldestFirst(tests);
  const fulls = finished.filter(isFullTest);
  const lastFull = fulls[fulls.length - 1];
  const aside = lastFull ? (
    <p className="text-sm text-muted-foreground">
      Latest full test <span className="font-bold tabular-nums text-foreground">{outOf400(lastFull)} / 400</span>
    </p>
  ) : null;

  // A line needs tests on two different days; until then it says where things stand in words
  const days = new Set(finished.map((t) => new Date(t.createdOn).toDateString()));
  if (days.size < 2) {
    return (
      <section aria-labelledby="chart-heading" className={SECTION}>
        <SectionHeading id="chart-heading" aside={aside}>
          Your tests over time
        </SectionHeading>
        <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
          {finished.length === 0
            ? "Finish a test to start your progress line here."
            : finished.length === 1
              ? `One test finished so far (${isFullTest(finished[0]) ? `${outOf400(finished[0])} / 400` : `${percentRight(finished[0])}% right`}). Your progress line starts once you've tested on two different days.`
              : `${finished.length} tests finished so far, all on ${formatDay(finished[0].createdOn)}. Your progress line starts once you've tested on two different days.`}
        </p>
      </section>
    );
  }

  const start = new Date(finished[0].createdOn).getTime();
  const end = new Date(finished[finished.length - 1].createdOn).getTime();
  const x = (iso: string) => PAD.left + ((new Date(iso).getTime() - start) / Math.max(end - start, 1)) * (W - PAD.left - PAD.right);
  const y = (pct: number) => PAD.top + (1 - pct / 100) * (H - PAD.top - PAD.bottom);
  const fullPath = fulls.map((t, i) => `${i === 0 ? "M" : "L"}${x(t.createdOn).toFixed(1)},${y(chartValueOf(t)).toFixed(1)}`).join(" ");
  const firstFull = fulls[0];
  const summary =
    firstFull && lastFull && firstFull !== lastFull
      ? `Full tests went from ${outOf400(firstFull)} to ${outOf400(lastFull)} out of 400 between ${formatDay(firstFull.createdOn)} and ${formatDay(lastFull.createdOn)}${outOf400(lastFull) >= 250 ? ", at or above the 250 pace." : `; the 250 pace is ${250 - outOf400(lastFull)} marks above the latest.`} ${finished.length - fulls.length} practice tests are shown as rings.`
      : `${finished.length} finished tests between ${formatDay(finished[0].createdOn)} and ${formatDay(finished[finished.length - 1].createdOn)}, as a percentage right.`;

  return (
    <section aria-labelledby="chart-heading" className={SECTION}>
      <SectionHeading id="chart-heading" aside={aside}>
        Your tests over time
      </SectionHeading>
      <figure ref={frameRef} className="mt-4 max-w-3xl">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block">
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(pct)} y2={y(pct)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(pct) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                {pct}%
              </text>
            </g>
          ))}
          {/* The pace for 250 / 400 (62.5% in each subject) is a full-test target, so it shows only with a full test */}
          {fulls.length > 0 && (
            <>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(62.5)} y2={y(62.5)} className="stroke-foreground" strokeWidth={1.5} strokeDasharray="5 5" />
              <text x={PAD.left + 6} y={y(62.5) - 6} className="fill-foreground text-[11px] font-semibold">
                250 / 400 pace
              </text>
            </>
          )}
          {fulls.length > 1 && <path d={fullPath} fill="none" className="stroke-brand-orange" strokeWidth={2.5} strokeLinejoin="round" />}
          {finished.map((t) =>
            isFullTest(t) ? (
              <circle key={t.id} cx={x(t.createdOn)} cy={y(chartValueOf(t))} r={5} className="fill-brand-orange" />
            ) : (
              <circle key={t.id} cx={x(t.createdOn)} cy={y(chartValueOf(t))} r={3.5} className="fill-card stroke-muted-foreground" strokeWidth={1.5} />
            ),
          )}
          <text x={PAD.left} y={H - 6} className="fill-muted-foreground text-[11px]">
            {formatDay(finished[0].createdOn)}
          </text>
          <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-muted-foreground text-[11px]">
            {formatDay(finished[finished.length - 1].createdOn)}
          </text>
        </svg>
        <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {fulls.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" aria-hidden="true" />
              Full tests (marks ÷ 4)
            </span>
          )}
          {fulls.length < finished.length && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-muted-foreground" aria-hidden="true" />
              Practice tests (% right)
            </span>
          )}
          {fulls.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-[1.5px] border-dashed border-foreground" aria-hidden="true" />
              250 / 400 pace
            </span>
          )}
        </figcaption>
      </figure>
    </section>
  );
};

export default HistoryChart;
