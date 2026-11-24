import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  DashboardCards,
  RecentTest,
  SubjectPerformanceDetail,
  TopicConfidence,
} from "../types/dashboardTypes";

interface PerformanceOverviewProps {
  recentTests: RecentTest[];
  recentTestsLoading?: boolean;
  recentTestsError?: string;
  /** The student's enrolled subjects. */
  subjects?: string[];
  cardsLoading?: boolean;
  topicConfidences?: TopicConfidence[];
  topicConfidencesLoading?: boolean;
  topicConfidencesError?: string;
  overallScore?: number;
  overallAccuracy?: number;
  overallSpeed?: number;
  subjectPerformance?: SubjectPerformanceDetail[];
  testsCompleted?: number;
  questionsAnswered?: number;
  monthlyPerformance?: Array<{ month: string; score: number }>;
  cards?: DashboardCards | null;
  onQuickLearn?: (payload: { topicName: string; subjectName: string }) => void;
}

const orange = "hsl(var(--brand-orange))";

const WEAK_TOPIC_BELOW = 75;

const confidenceColor = (v: number) =>
  v < 50 ? "hsl(0 72% 50%)" : v < 75 ? "hsl(38 92% 40%)" : "hsl(142 71% 35%)";

const confidenceIndicator = (v: number) =>
  v < 50 ? "bg-red-500" : v < 75 ? "bg-amber-500" : "bg-emerald-500";

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  recentTests = [],
  recentTestsLoading = false,
  recentTestsError = "",
  subjects = [],
  cardsLoading = false,
  topicConfidences = [],
  topicConfidencesLoading = false,
  topicConfidencesError = "",
  cards = null,
  onQuickLearn,
}) => {
  const [activeTab, setActiveTab] = useState<"weak-areas" | "trends">("weak-areas");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const chartData = React.useMemo(() => {
    if (!recentTests || recentTests.length === 0) return [];
    return recentTests
      .flatMap((test) => {
        const dateObj = new Date(test.dateTaken);
        const date = `${dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
        if (selectedSubject === "All") {
          return [{ date, score: Math.round(test.totalScorePercentage) }];
        }
        const subj = test.subjects.find(
          (s) => s.name.toLowerCase() === selectedSubject.toLowerCase(),
        );
        // A test without this subject is not a score of 0
        return subj ? [{ date, score: Math.round(subj.scorePercentage) }] : [];
      })
      .reverse();
  }, [recentTests, selectedSubject]);

  const formatMetric = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
  };

  const scoredCards = !cardsLoading && cards?.numberOfTestCompleted ? cards : null;
  const formatPercent = (value: number | null | undefined) =>
    value === null || value === undefined ? "-" : `${formatMetric(value)}%`;

  // Newest first, and already a percentage (the cards only carry the raw mark)
  const lastTestPercentage = scoredCards ? recentTests[0]?.totalScorePercentage : undefined;
  const change = scoredCards?.improvementRate;
  const weakTopics = topicConfidences.filter((t) => t.confidenceLevelValue < WEAK_TOPIC_BELOW);

  const formatSubject = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const tabs: Array<"weak-areas" | "trends"> = ["weak-areas", "trends"];
  const tabLabels: Record<string, string> = {
    "weak-areas": "Weak Areas",
    trends: "Performance Trends",
  };

  return (
    <div className="w-full">
      {/* KPI stat strip */}
      <div className="flex items-start gap-0 divide-x divide-border mb-10 border rounded-xl overflow-hidden">
        <div className="flex-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Last Test Score
          </p>
          <p className="text-4xl font-black tabular-nums leading-none">
            {formatPercent(lastTestPercentage)}
          </p>
          {change !== null && change !== undefined && (
            <p
              className={`text-xs mt-2 flex items-center gap-0.5 ${
                change < 0 ? "text-red-500" : change > 0 ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              {change > 0 && <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />}
              {change < 0 && <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
              {change === 0
                ? "Same as previous test"
                : `${formatMetric(Math.abs(change))}% ${change < 0 ? "lower" : "higher"} than previous test`}
            </p>
          )}
        </div>

        <div className="flex-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Best Score
          </p>
          <p className="text-4xl font-black tabular-nums leading-none">
            {formatPercent(scoredCards?.bestScorePercentage)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            best score percentage
          </p>
        </div>

        <div className="flex-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Accuracy
          </p>
          <p className="text-4xl font-black tabular-nums leading-none">
            {formatPercent(scoredCards?.accuracy)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
          </p>
        </div>

      </div>

      {/* Underline tabs */}
      <div className="flex gap-6 border-b border-border mb-7">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="pb-3 text-sm font-medium transition-colors"
            style={
              activeTab === tab
                ? {
                  borderBottom: `2px solid ${orange}`,
                  color: "hsl(var(--foreground))",
                  marginBottom: "-1px",
                }
                : { color: "hsl(var(--muted-foreground))" }
            }
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Weak Areas */}
      {activeTab === "weak-areas" && (
        <div>
          {weakTopics.length > 0 && (
            <p className="text-sm text-muted-foreground mb-5">
              Focus on these topics to improve your overall score
            </p>
          )}
          {topicConfidencesLoading ? (
            <p className="text-sm text-muted-foreground">Loading weak areas…</p>
          ) : topicConfidencesError ? (
            <p className="text-sm text-red-500">{topicConfidencesError}</p>
          ) : weakTopics.length > 0 ? (
            <div className="space-y-5">
              {weakTopics.map((item) => (
                <div key={`${item.subjectName}-${item.topicName}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="min-w-0 mr-3">
                      <span className="text-sm font-medium">{item.topicName}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({formatSubject(item.subjectName)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLearn?.({
                            topicName: item.topicName,
                            subjectName: item.subjectName,
                          })
                        }
                        className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                        style={{
                          borderColor: "hsl(25 95% 53% / 0.35)",
                          color: orange,
                        }}
                      >
                        Quick Learn
                      </button>
                      <span
                        className="text-sm font-black tabular-nums w-9 text-right"
                        style={{ color: confidenceColor(item.confidenceLevelValue) }}
                      >
                        {Math.round(item.confidenceLevelValue)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.round(item.confidenceLevelValue)}
                    className="h-1"
                    indicatorClassName={confidenceIndicator(item.confidenceLevelValue)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {topicConfidences.length > 0
                ? `None of your measured topics are below ${WEAK_TOPIC_BELOW}%.`
                : "Not enough answers to spot weak topics yet. A topic is measured after 6 answered questions."}
            </p>
          )}
        </div>
      )}

      {/* Performance Trends */}
      {activeTab === "trends" && (
        <div>
          {/* Subject filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["All", ...subjects].map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={
                  selectedSubject === sub
                    ? {
                      borderColor: orange,
                      backgroundColor: "hsl(25 95% 53% / 0.1)",
                      color: "hsl(var(--foreground))",
                    }
                    : {
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--muted-foreground))",
                    }
                }
              >
                {formatSubject(sub)}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-5">
            {selectedSubject === "All"
              ? "Total score per test over time"
              : `${formatSubject(selectedSubject)} score per test over time`}
          </p>

          {recentTestsLoading ? (
            <p className="text-sm text-muted-foreground">Loading scores…</p>
          ) : recentTestsError ? (
            <p role="alert" className="text-sm text-red-500">
              We couldn't load your test scores. Refresh the page to try again.
            </p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedSubject === "All"
                ? "No test scores yet."
                : `No ${formatSubject(selectedSubject)} scores in your recent tests.`}
            </p>
          ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(value: number) => [`${value}%`, "Score"]}
                />
                <Bar
                  dataKey="score"
                  fill="hsl(25, 95%, 53%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceOverview;
