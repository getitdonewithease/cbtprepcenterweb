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

const SUBJECTS = ["All", "Mathematics", "English", "Physics", "Chemistry"];

const confidenceColor = (v: number) =>
  v < 50 ? "hsl(0 72% 50%)" : v < 75 ? "hsl(38 92% 40%)" : "hsl(142 71% 35%)";

const confidenceIndicator = (v: number) =>
  v < 50 ? "bg-red-500" : v < 75 ? "bg-amber-500" : "bg-emerald-500";

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  recentTests = [],
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
      .map((test) => {
        const dateObj = new Date(test.dateTaken);
        const dateLabel = `${dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
        if (selectedSubject === "All") {
          return { date: dateLabel, score: Math.round(test.totalScorePercentage) };
        }
        const subj = test.subjects.find(
          (s) => s.name.toLowerCase() === selectedSubject.toLowerCase(),
        );
        return { date: dateLabel, score: subj ? Math.round(subj.scorePercentage) : 0 };
      })
      .reverse();
  }, [recentTests, selectedSubject]);

  const formatMetric = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
  };

  const improvementRate = Math.abs(cards?.improvementRate ?? 0);
  const chevronDirection = (cards?.improvementRate ?? 0) < 0 ? "down" : "up";
  const improvementColor = (cards?.improvementRate ?? 0) < 0 ? "text-red-500" : "text-green-600";

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
            {formatMetric(cards?.lastTestScore)}
          </p>
          <p className={`text-xs mt-2 flex items-center gap-0.5 ${improvementColor}`}>
            {chevronDirection === "up" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {improvementRate}% vs last test
          </p>
        </div>

        <div className="flex-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Best Score
          </p>
          <p className="text-4xl font-black tabular-nums leading-none">
            {formatMetric(cards?.bestScorePercentage)}%
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
            {formatMetric(cards?.accuracy)}%
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
          <p className="text-sm text-muted-foreground mb-5">
            Focus on these topics to improve your overall score
          </p>
          {topicConfidencesLoading ? (
            <p className="text-sm text-muted-foreground">Loading weak areas…</p>
          ) : topicConfidencesError ? (
            <p className="text-sm text-red-500">{topicConfidencesError}</p>
          ) : topicConfidences.length > 0 ? (
            <div className="space-y-5">
              {topicConfidences.map((item) => (
                <div key={`${item.subjectName}-${item.topicName}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="min-w-0 mr-3">
                      <span className="text-sm font-medium">{item.topicName}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({formatSubject(item.subjectName)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {item.confidenceLevelValue < 75 && (
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
                      )}
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
              No low-confidence topics yet.
            </p>
          )}
        </div>
      )}

      {/* Performance Trends */}
      {activeTab === "trends" && (
        <div>
          {/* Subject filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {SUBJECTS.map((sub) => (
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
                {sub}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-5">
            {selectedSubject === "All"
              ? "Total score per test over time"
              : `${selectedSubject} score per test over time`}
          </p>

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
        </div>
      )}
    </div>
  );
};

export default PerformanceOverview;
