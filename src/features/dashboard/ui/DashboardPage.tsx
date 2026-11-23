import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  BarChart3,
  Clock,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";

import PerformanceOverview from "./PerformanceOverview";
import Layout from "@/components/common/Layout";
import { formatDuration } from "@/core/utils/formatDuration";
import { useDashboard } from "../hooks/useDashboard";
import { PracticeTestType } from "../types/dashboardTypes";
import { useNavigate } from "react-router-dom";
import {
  StreakCalendarCard,
  useDailyChallengeStreak,
  CalendarDayModel,
  CompletionStatus,
} from "@/features/daily-challenge";

interface ChatLaunchRequest {
  id: number;
  message: string;
}

const orange = "hsl(var(--brand-orange))";

const scoreColor = (pct: number) =>
  pct >= 80
    ? "hsl(142 71% 35%)"
    : pct >= 60
    ? "hsl(38 92% 40%)"
    : "hsl(0 72% 50%)";

const capitalise = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [chatLaunchRequest, setChatLaunchRequest] = useState<ChatLaunchRequest | null>(null);
  const {
    user,
    userLoading,
    userError,
    recentTests,
    recentTestsLoading,
    recentTestsError,
    subjectsPerformance,
    subjectsPerformanceLoading,
    subjectsPerformanceError,
    topicConfidences,
    topicConfidencesLoading,
    topicConfidencesError,
    cards,
    cardsLoading,
    cardsError,
  } = useDashboard();

  const formatMetric = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
  };

  // With no completed test there is nothing to average, so show "-" rather than 0
  const scoredCards = !cardsLoading && cards?.numberOfTestCompleted ? cards : null;
  const quickStats = [
    { label: "Tests Completed", value: cardsLoading ? "-" : cards?.numberOfTestCompleted ?? "-", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Avg. Score", value: scoredCards ? `${formatMetric(scoredCards.averageScore)}%` : "-", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Avg. Speed", value: scoredCards?.averageSpeed ? formatDuration(scoredCards.averageSpeed) : "-", icon: <Clock className="h-4 w-4" /> },
  ];

  const handleQuickLearn = ({ topicName, subjectName }: { topicName: string; subjectName: string }) => {
    setChatLaunchRequest({
      id: Date.now(),
      message: `Help me quickly learn ${topicName} in ${subjectName}. Focus on core concepts, common mistakes, and 3 short practice questions.`,
    });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { id: "performance", label: "Performance", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  const {
    monthLabel,
    currentStreak,
    longestStreak,
    calendarDays,
    startOffset,
    loading: streakLoading,
    error: streakError,
    refetch: refetchStreak,
    canGoNext,
    goToPrevMonth,
    goToNextMonth,
  } = useDailyChallengeStreak();

  const handleSelectChallengeDate = (dateString: string, day?: CalendarDayModel) => {
    const isCompleted =
      day?.completionStatus === CompletionStatus.Completed ||
      day?.completionStatus === CompletionStatus.LateCompletion ||
      day?.statusVisual === "completed" ||
      day?.statusVisual === "late_completion";

    if (isCompleted) {
      navigate(`/daily-challenge/review/${dateString}`);
    } else {
      navigate(`/daily-challenge/${dateString}`);
    }
  };

  return (
    <Layout
      title="Dashboard"
      chatLaunchRequest={chatLaunchRequest ?? undefined}
    >
      <div className="relative overflow-hidden">
        {/* Ambient brand glow over the welcome + KPI zone */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 65% 40% at 0% 0%, hsl(25,95%,53%), transparent)",
            opacity: 0.10,
          }}
        />

      {userLoading ? (
        <div className="flex justify-center items-center h-full min-h-[400px]">
          Loading…
        </div>
      ) : userError ? (
        <div className="flex justify-center items-center h-full min-h-[400px] text-foreground">
          We couldn't load your dashboard.
        </div>
      ) : (
        <>
          {cardsError ? (
            <SectionAlertBanner
              title="Unable to load dashboard cards"
              description={cardsError}
            />
          ) : null}
          {/* ── Welcome + Quick Stats ── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,380px)] xl:items-start">
            <div className="min-w-0">
          <section className="mb-10">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: orange }}
            >
              Welcome back, {user?.firstName ?? "Student"}
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              Your Exam Progress
            </h2>

                <div className="mt-6 flex w-full min-w-0 items-start gap-0 divide-x divide-border overflow-hidden rounded-xl border">
                  {quickStats.map((stat, i) => (
                    <div key={i} className="min-w-0 flex-1 px-4 py-4">
                    <div className="mb-2" style={{ color: orange }}>{stat.icon}</div>
                    <p
                      className="text-2xl font-black tabular-nums leading-none"
                      style={{ color: orange }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                  ))}
                </div>

                <div className="mt-4 xl:hidden">
                  <StreakCalendarCard
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
                    monthLabel={monthLabel}
                    startOffset={startOffset}
                    calendarDays={calendarDays}
                    loading={streakLoading}
                    error={streakError}
                    onRetry={refetchStreak}
                    canGoNext={canGoNext}
                    onPrevMonth={goToPrevMonth}
                    onNextMonth={goToNextMonth}
                    onSelectDate={handleSelectChallengeDate}
                  />
                </div>
              </section>

          {/* ── Tabs ── */}
          <div className="flex gap-1 border-b border-border mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 pb-3 text-sm font-medium transition-colors"
                style={
                  activeTab === tab.id
                    ? {
                        borderBottom: `2px solid ${orange}`,
                        color: "hsl(var(--foreground))",
                        marginBottom: "-1px",
                      }
                    : { color: "hsl(var(--muted-foreground))" }
                }
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <>
              {/* Subject Progress */}
              <div className="mb-10">
                <h3 className="text-base font-semibold mb-5">
                  Subject Progress
                </h3>
                <div className="space-y-5">
                  {subjectsPerformanceLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-3 w-1/4" />
                        <Skeleton className="h-1 w-full" />
                      </div>
                    ))
                  ) : subjectsPerformanceError ? (
                    <p className="text-sm text-red-500">
                      {subjectsPerformanceError}
                    </p>
                  ) : subjectsPerformance && subjectsPerformance.length > 0 ? (
                    subjectsPerformance.map((subject, i) => {
                      const pct = Math.round(subject.percentage);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium">
                              {capitalise(subject.subjectName)}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                          <Progress
                            value={pct}
                            className="h-1"
                            indicatorClassName="bg-[hsl(25,95%,53%)]"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No subject scores yet. Take a test to see your progress.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Tests */}
              <div>
                <h3 className="text-base font-semibold mb-5">Recent Tests</h3>
                <div>
                  {recentTestsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-border/60 py-4"
                      >
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-5 w-10" />
                      </div>
                    ))
                  ) : recentTestsError ? (
                    <p className="text-sm text-red-500">{recentTestsError}</p>
                  ) : recentTests.length > 0 ? (
                    recentTests.slice(0, 5).map((test, i) => {
                      const pct = Math.round(test.totalScorePercentage || 0);
                      const subjectNames = test.subjects
                        .map((s) => capitalise(s.name))
                        .join(" · ");
                      const dateStr = new Date(
                        test.dateTaken,
                      ).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      });
                      const typeLabel = PracticeTestType[test.practiceTestType];
                      return (
                        <div
                          key={test.testId}
                          className={`flex items-center justify-between py-4 ${i < recentTests.slice(0, 5).length - 1 ? "border-b border-border/60" : ""}`}
                        >
                          <div className="min-w-0 mr-4">
                            <p className="text-sm font-medium truncate">
                              {subjectNames}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {dateStr} · {typeLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className="text-sm font-black tabular-nums w-10 text-right"
                              style={{ color: scoreColor(pct) }}
                            >
                              {pct}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                navigate(`/practice/review/${test.testId}`)
                              }
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recent tests yet.
                    </p>
                  )}
                </div>

                {recentTests.length > 0 && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => navigate("/test-history")}
                      className="text-sm font-medium underline-offset-4 hover:underline transition-colors"
                      style={{ color: orange }}
                    >
                      View all tests →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Performance ── */}
          {activeTab === "performance" && (
            <PerformanceOverview
              subjects={user?.courses ?? []}
              recentTests={recentTests}
              recentTestsLoading={recentTestsLoading}
              recentTestsError={recentTestsError}
              cardsLoading={cardsLoading}
              topicConfidences={topicConfidences}
              topicConfidencesLoading={topicConfidencesLoading}
              topicConfidencesError={topicConfidencesError}
              cards={cards}
              onQuickLearn={handleQuickLearn}
            />
          )}
            </div>

            <aside className="hidden w-full xl:sticky xl:top-20 xl:block">
              <StreakCalendarCard
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                monthLabel={monthLabel}
                startOffset={startOffset}
                calendarDays={calendarDays}
                loading={streakLoading}
                error={streakError}
                onRetry={refetchStreak}
                canGoNext={canGoNext}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onSelectDate={handleSelectChallengeDate}
              />
            </aside>
          </div>
        </>
      )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
