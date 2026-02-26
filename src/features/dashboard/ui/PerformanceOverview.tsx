import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  AlertTriangle,
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
  overallSpeed?: number; // in seconds per question
  subjectPerformance?: SubjectPerformanceDetail[];
  testsCompleted?: number;
  questionsAnswered?: number;
  monthlyPerformance?: Array<{
    month: string;
    score: number;
  }>;
}

const SUBJECTS = ["All", "Mathematics", "English", "Physics", "Chemistry"];

// Helper to parse averageSpeed string (e.g., "00:00:03.5882350") to seconds
function parseTimeToSeconds(time: string): number {
  if (!time) return 0;
  const parts = time.split(":");
  if (parts.length !== 4 && parts.length !== 3) return 0;
  // If format is HH:MM:SS.ssssss
  const [hh, mm, ss] = parts.length === 4 ? parts.slice(1) : parts;
  const [sec, ms = "0"] = ss.split(".");
  return (
    parseInt(hh) * 3600 +
    parseInt(mm) * 60 +
    parseInt(sec) +
    (ms ? parseFloat("0." + ms) : 0)
  );
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  recentTests = [],
  topicConfidences = [],
  topicConfidencesLoading = false,
  topicConfidencesError = "",
  overallScore = 68,
  overallAccuracy = 72,
  overallSpeed = 45,
  testsCompleted = 12,
  questionsAnswered = 480,
  monthlyPerformance = [],
  subjectPerformance = [
    {
      subject: "Mathematics",
      score: 90,
      accuracy: 80,
      speed: 40,
      weakTopics: [
        { name: "Calculus", score: 45 },
        { name: "Probability", score: 52 },
        { name: "Matrices", score: 60 },
      ],
    },
    {
      subject: "English",
      score: 80,
      accuracy: 85,
      speed: 35,
      weakTopics: [
        { name: "Comprehension", score: 65 },
        { name: "Lexis & Structure", score: 70 },
      ],
    },
    {
      subject: "Physics",
      score: 65,
      accuracy: 62,
      speed: 50,
      weakTopics: [
        { name: "Electromagnetism", score: 40 },
        { name: "Optics", score: 45 },
        { name: "Mechanics", score: 55 },
      ],
    },
    {
      subject: "Chemistry",
      score: 70,
      accuracy: 68,
      speed: 48,
      weakTopics: [
        { name: "Organic Chemistry", score: 50 },
        { name: "Electrochemistry", score: 55 },
      ],
    },
  ],
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Prepare data for the BarChart based on recentTests and selectedSubject
  const chartData = React.useMemo(() => {
    if (!recentTests || recentTests.length === 0) return [];
    return recentTests
      .map((test) => {
        const dateObj = new Date(test.dateTaken);
        const dateLabel = `${dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
        if (selectedSubject === "All") {
          return { date: dateLabel, score: Math.round(test.totalScorePercentage) };
        } else {
          // Find the subject score for this test
          const subj = test.subjects.find(
            (s) => s.name.toLowerCase() === selectedSubject.toLowerCase()
          );
          return { date: dateLabel, score: subj ? Math.round(subj.scorePercentage) : 0 };
        }
      })
      .reverse(); // Show oldest to newest left to right
  }, [recentTests, selectedSubject]);

  // Calculate overallScore and improvementRate from recentTests
  const totalScore = React.useMemo(() => {
    if (!recentTests || recentTests.length === 0) return 0;
    const totalPercentage = recentTests.reduce(
      (acc, test) => acc + (test.totalScorePercentage || 0),
      0,
    );
    return Math.round(totalPercentage / recentTests.length);
  }, [recentTests]);

  const [improvementRate, chevronDirection, improvementColor] = React.useMemo(() => {
    if (!recentTests || recentTests.length < 2) return [0, "up", "text-green-500"];

    const sortedByDate = [...recentTests].sort(
      (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime(),
    );
    const latest = sortedByDate[0]?.totalScorePercentage || 0;
    const prev = sortedByDate[1]?.totalScorePercentage || 0;

    if (prev === 0) return [0, "up", "text-green-500"];
    const diff = latest - prev;
    const percent = Math.abs((diff / prev) * 100);
    const roundedPercent = Math.round(percent * 10) / 10;
    if (diff === 0) return [0, "up", "text-green-500"];
    if (diff > 0) return [roundedPercent, "up", "text-green-500"];
    return [roundedPercent, "down", "text-red-500"];
  }, [recentTests]);

  const totalCorrectAnswers = React.useMemo(() => {
    if (!recentTests || recentTests.length === 0) return 0;
    return recentTests.reduce((acc, test) => acc + (test.numberOfCorrectAnswers || 0), 0);
  }, [recentTests]);

  const totalAttemptedQuestions = React.useMemo(() => {
    if (!recentTests || recentTests.length === 0) return 0;
    return recentTests.reduce((acc, test) => acc + (test.numberOfQuestionsAttempted || 0), 0);
  }, [recentTests]);

  const calculatedAccuracy = React.useMemo(() => {
    if (totalAttemptedQuestions === 0) return 0;
    return Math.round((totalCorrectAnswers / totalAttemptedQuestions) * 100);
  }, [totalCorrectAnswers, totalAttemptedQuestions]);

  const aggregateAverageSpeed = React.useMemo(() => {
    if (!recentTests || recentTests.length === 0) return 0;
    let totalWeightedSpeed = 0;
    let totalAttempted = 0;
    for (const test of recentTests) {
      const speedSec = parseTimeToSeconds(test.averageSpeed);
      totalWeightedSpeed += speedSec * (test.numberOfQuestionsAttempted || 0);
      totalAttempted += test.numberOfQuestionsAttempted || 0;
    }
    if (totalAttempted === 0) return 0;
    return Math.round((totalWeightedSpeed / totalAttempted) * 100) / 100;
  }, [recentTests]);

  const formatSubjectName = (subjectName: string) =>
    subjectName
      ? subjectName.charAt(0).toUpperCase() + subjectName.slice(1)
      : subjectName;

  const getConfidenceIndicatorClass = (value: number) => {
    if (value < 50) return "bg-red-500";
    if (value < 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="w-full bg-background p-4 rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Performance Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{totalScore}%</div>
                <div className={`flex items-center mt-1 text-sm ${improvementColor}`}>
                  {chevronDirection === 'up' ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {improvementRate}%
                  <span className="text-muted-foreground ml-1">
                    vs previous test
                  </span>
                </div>
              </div>
            </div>
            <Progress value={Math.min(totalScore, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{calculatedAccuracy}%</div>
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-500 mr-1" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalCorrectAnswers} correct out of {totalAttemptedQuestions} attempted
            </div>
            <Progress value={calculatedAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{aggregateAverageSpeed}s</div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-1" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              per question across {recentTests.length} tests
            </div>
            <Progress
              value={(100)}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs and their content are commented out below */}
      <Tabs defaultValue="weak-areas" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="weak-areas">Weak Areas</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          {/* <TabsTrigger value="subjects">Subject Performance</TabsTrigger> */}
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              {/* Subject Tabs for BarChart */}
              <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-4">
                <TabsList>
                  {SUBJECTS.map((subject) => (
                    <TabsTrigger key={subject} value={subject}>{subject}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                {selectedSubject === "All"
                  ? "Your total score per test over time"
                  : `Your ${selectedSubject} score per test over time`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Score"]}
                    />
                    <Bar
                      dataKey="score"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>
                  Your performance across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {subjectPerformance.map((subject) => (
                    <Card key={subject.subject}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{subject.subject}</CardTitle>
                          <Badge
                            variant={
                              subject.score >= 70 ? "default" : "outline"
                            }
                          >
                            {subject.score}%
                          </Badge>
                        </div>
                        <CardDescription>
                          Accuracy: {subject.accuracy}% | Speed: {subject.speed}
                          s per question
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h4 className="text-sm font-semibold mb-2">
                          Weak Topics:
                        </h4>
                        <div className="space-y-2">
                          {subject.weakTopics.map((topic) => (
                            <div
                              key={topic.name}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <AlertTriangle className="h-3 w-3 text-amber-500 mr-2" />
                                <span className="text-sm">{topic.name}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {topic.score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}

        {/* <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Your performance over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPerformance}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Score"]}
                    />
                    <Bar
                      dataKey="score"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="weak-areas">
          <Card>
            <CardHeader>
              <CardTitle>Areas Needing Improvement</CardTitle>
              <CardDescription>
                Focus on these topics to improve your overall score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicConfidencesLoading ? (
                  <p className="text-muted-foreground">Loading weak areas...</p>
                ) : topicConfidencesError ? (
                  <p className="text-red-500">{topicConfidencesError}</p>
                ) : topicConfidences.length > 0 ? (
                  topicConfidences.map((item, index) => (
                    <div key={`${item.subjectName}-${item.topicName}`}>
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium">{item.topicName}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            ({formatSubjectName(item.subjectName)})
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            item.confidenceLevelValue < 50
                              ? "text-red-500"
                              : "text-amber-500"
                          }
                        >
                          {Math.round(item.confidenceLevelValue)}%
                        </Badge>
                      </div>
                      <Progress
                        value={Math.round(item.confidenceLevelValue)}
                        className="h-2"
                        indicatorClassName={getConfidenceIndicatorClass(
                          Math.round(item.confidenceLevelValue),
                        )}
                      />
                      {index < topicConfidences.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No low-confidence topics yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subject selector for BarChart */}

    </div>
  );
};

export default PerformanceOverview; 