import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  BookOpen,
  BarChart3,
  Trophy,
  Clock,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";

import PerformanceOverview from "./PerformanceOverview";
import NewTestDialog from "./NewTestDialog";
import Layout from "@/components/common/Layout";
import { useDashboard } from "../hooks/useDashboard";
import { PracticeTestType } from "../types/dashboardTypes";
import { useNavigate } from "react-router-dom";

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
  const [preparingDialogOpen, setPreparingDialogOpen] = useState(true);
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
    avgScore,
    preparing,
    showPreparedDialog,
    prepareError,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
    clearPrepareError,
  } = useDashboard();

  const wasPreparing = useRef(false);
  useEffect(() => {
    if (wasPreparing.current && !preparing && !showPreparedDialog && !preparingDialogOpen) {
      toast({
        title: "Questions Ready!",
        description: "Your practice test is ready to start.",
      });
    }
    wasPreparing.current = preparing;
  }, [preparing, showPreparedDialog, preparingDialogOpen]);

  const formatMetric = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
  };

  const quickStats = [
    { label: "Tests Completed", value: cardsLoading ? "-" : cards?.numberOfTestCompleted ?? "-", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Avg. Score", value: cardsLoading ? "-" : `${formatMetric(avgScore)}`, icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Avg. Speed", value: cardsLoading ? "-" : `${formatMetric(cards?.averageSpeed)}s`, icon: <Clock className="h-4 w-4" /> },
  ];

  const showPreparingDialog = preparing && preparingDialogOpen;

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

  return (
    <Layout
      title="Dashboard"
      chatLaunchRequest={chatLaunchRequest ?? undefined}
      headerActions={
        <div className="flex items-center gap-2">
          <NewTestDialog onStart={handlePrepareTest} subjects={user?.courses || []}>
            <Button className="text-white" style={{ backgroundColor: orange }}>
              Start New Test
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </NewTestDialog>
          <div className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium text-muted-foreground">
            <Trophy className="h-4 w-4" style={{ color: orange }} />
            <span>{cards?.rank !== null && cards?.rank !== undefined ? `#${cards.rank}` : "-"}</span>
          </div>
        </div>
      }
    >
      {/* Preparing dialog */}
      <Dialog open={showPreparingDialog} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-sm text-center"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Preparing Test</DialogTitle>
          <div
            className="h-1 w-16 rounded-full mx-auto mb-4"
            style={{ backgroundColor: orange }}
          />
          <p className="text-base font-semibold">Preparing your test…</p>
          <p className="text-sm text-muted-foreground mt-1">
            This takes a few seconds.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-muted-foreground"
            onClick={() => setPreparingDialogOpen(false)}
          >
            Continue in background
          </Button>
        </DialogContent>
      </Dialog>

      {/* Prepared dialog */}
      <Dialog open={showPreparedDialog} onOpenChange={setShowPreparedDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogTitle className="sr-only">Test Ready</DialogTitle>
          <div
            className="h-1 w-16 rounded-full mx-auto mb-4"
            style={{ backgroundColor: orange }}
          />
          <p className="text-base font-semibold">Ready to go!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your questions are prepared.
          </p>
          <div className="flex flex-col gap-2 mt-5">
            <Button
              className="w-full text-white"
              style={{ backgroundColor: orange }}
              onClick={handleGoToTest}
            >
              Go to Test
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowPreparedDialog(false)}
            >
              Not now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
        <div className="flex justify-center items-center h-full min-h-[400px] text-red-500">
          {userError}
        </div>
      ) : (
        <>
          {prepareError ? (
            <SectionAlertBanner
              title="Unable to prepare test"
              description={prepareError}
              onDismiss={clearPrepareError}
            />
          ) : null}
          {cardsError ? (
            <SectionAlertBanner
              title="Unable to load dashboard cards"
              description={cardsError}
            />
          ) : null}
          {/* ── Welcome + Quick Stats ── */}
          <section className="mb-10">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: orange }}
            >
              Welcome back, {user?.firstName ?? "Student"}
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              Your UTME Progress
            </h2>

            <div className="flex items-stretch gap-0 divide-x divide-border mt-6 border rounded-xl overflow-hidden">
              {quickStats.map((stat, i) => (
                <div key={i} className="flex-1 px-4 py-4 min-w-0">
                  <div className="mb-2" style={{ color: orange }}>{stat.icon}</div>
                  <p
                    className="text-2xl font-black tabular-nums leading-none"
                    style={{ color: orange }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 truncate">
                    {stat.label}
                  </p>
                </div>
              ))}
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
                      No subjects found.
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
              recentTests={recentTests}
              topicConfidences={topicConfidences}
              topicConfidencesLoading={topicConfidencesLoading}
              topicConfidencesError={topicConfidencesError}
              cards={cards}
              onQuickLearn={handleQuickLearn}
            />
          )}
        </>
      )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
