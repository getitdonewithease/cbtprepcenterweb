import { useState, type MouseEvent } from "react";
import Layout from "@/components/common/Layout";
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

/** Edge to edge on phones (cancels the page padding), one rounded sheet from sm up. */
const SHEET =
  "-mx-2 -mt-4 grid grid-cols-1 border-y bg-card sm:mx-0 sm:mt-0 sm:rounded-2xl sm:border sm:shadow-soft lg:grid-cols-12";

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
      <div className="fasiti-theme mx-auto max-w-6xl text-foreground">
        {summary.userError ? (
          <div role="alert" className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-center shadow-soft">
            <p className="font-semibold">We couldn&apos;t load your dashboard.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <button type="button" onClick={() => window.location.reload()} className={secondaryButton("mt-4")}>
              Try again
            </button>
          </div>
        ) : summary.userLoading ? (
          <div className={SHEET} aria-busy="true" aria-label="Loading your dashboard">
            <div className="space-y-4 p-5 sm:p-8 lg:col-span-7">
              <Skeleton className="h-16 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-4 border-t p-5 sm:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-56" />
            </div>
          </div>
        ) : (
          <div className={SHEET}>
            {/* Two independent columns, so a short section never opens a gap beside a tall one */}
            <div className="lg:col-span-7">
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
            <div className="border-t lg:col-span-5 lg:border-l lg:border-t-0">
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
