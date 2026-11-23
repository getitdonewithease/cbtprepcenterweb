import { useState, type MouseEvent } from "react";
import Layout from "@/components/common/Layout";
import { cn } from "@/core/ui/cn";
import { useStartTest } from "../contexts/StartTestContext";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import ScoreSlip from "./overview/ScoreSlip";
import StudyNext from "./overview/StudyNext";
import ChallengeMonth from "./overview/ChallengeMonth";
import RecentTests from "./overview/RecentTests";
import { Skeleton, secondaryButton } from "./overview/sheetParts";

/**
 * Dashboard, "one sheet" (design-system/fasiti/MASTER.md, approved as option A2):
 * one continuous surface divided by hairlines instead of separate floating cards.
 * Phone, DOM and reading order: score, study next, daily challenge month, recent tests.
 * Desktop: score over study next on the left; the month over recent tests on the right.
 */

interface ChatLaunchRequest {
  id: number;
  message: string;
}

/**
 * No card: the sections sit on the page itself, divided by hairlines, with one vertical
 * line between the two desktop columns. The first section in each column starts flush
 * with the top of the page area.
 */
const LAYOUT = "grid grid-cols-1 lg:grid-cols-12";
const LEFT_COLUMN = "lg:col-span-7 lg:pr-10 xl:pr-14 [&>section:first-child]:pt-0";
const RIGHT_COLUMN =
  "border-t lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 xl:pl-14 lg:[&>section:first-child]:pt-0";

const DashboardPage = () => {
  const summary = useDashboardSummary();
  const { openSetup } = useStartTest();
  const [chatLaunchRequest, setChatLaunchRequest] = useState<ChatLaunchRequest | null>(null);

  const startTest = (event: MouseEvent<HTMLButtonElement>) => openSetup(event.currentTarget);

  const askTutor = (subject: string, topic?: string) =>
    setChatLaunchRequest({
      id: Date.now(),
      message: topic
        ? `Teach me ${topic} in ${subject} for the UTME. Start with the core ideas, show the common mistakes, then give me 3 short practice questions.`
        : `Teach me the topics in ${subject} that UTME candidates most often get wrong. Start with the core ideas, then give me 3 short practice questions.`,
    });

  return (
    <Layout title="Dashboard" chatLaunchRequest={chatLaunchRequest ?? undefined}>
      {/* Phones: 16px gutters, matching the top bar. Very wide screens: capped so lines stay readable */}
      <div className="fasiti-theme max-w-[1600px] px-2 text-foreground sm:px-0">
        {summary.userError ? (
          <div role="alert" className="max-w-md">
            <p className="font-semibold">We couldn&apos;t load your dashboard.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <button type="button" onClick={() => window.location.reload()} className={secondaryButton("mt-4")}>
              Try again
            </button>
          </div>
        ) : summary.userLoading ? (
          <div className={LAYOUT} aria-busy="true" aria-label="Loading your dashboard">
            <div className={cn(LEFT_COLUMN, "space-y-4")}>
              <Skeleton className="h-16 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className={cn(RIGHT_COLUMN, "space-y-4 pt-8 lg:pt-0")}>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-56" />
            </div>
          </div>
        ) : (
          <div className={LAYOUT}>
            {/* Two independent columns, so a short section never opens a gap beside a tall one */}
            <div className={LEFT_COLUMN}>
              <ScoreSlip
                summary={summary.score}
                isLoading={summary.scoreLoading}
                error={summary.scoreError}
                onStartFullTest={startTest}
              />
              <div className="border-t">
                <StudyNext
                  focus={summary.focus}
                  isLoading={summary.focusLoading}
                  onPractise={startTest}
                  onAskTutor={askTutor}
                />
              </div>
            </div>
            <div className={RIGHT_COLUMN}>
              <ChallengeMonth
                label={summary.month.label}
                days={summary.month.days}
                offset={summary.month.offset}
                totals={summary.month.totals}
                currentStreak={summary.month.currentStreak}
                longestStreak={summary.month.longestStreak}
                testDates={summary.month.testDates}
                isLoading={summary.month.loading}
                error={summary.month.error}
                onRetry={summary.month.retry}
                canGoNext={summary.month.canGoNext}
                onPrevMonth={summary.month.goToPrevMonth}
                onNextMonth={summary.month.goToNextMonth}
              />
              <div className="border-t">
                <RecentTests rows={summary.ledger} isLoading={summary.ledgerLoading} error={summary.ledgerError} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
