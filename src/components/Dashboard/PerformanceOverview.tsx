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
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SubjectPerformance {
  subject: string;
  score: number;
  accuracy: number;
  speed: number;
  weakTopics: Array<{
    name: string;
    score: number;
  }>;
}

interface PerformanceOverviewProps {
  overallScore?: number;
  overallAccuracy?: number;
  overallSpeed?: number; // in seconds per question
  subjectPerformance?: SubjectPerformance[];
  testsCompleted?: number;
  questionsAnswered?: number;
  improvementRate?: number;
  monthlyPerformance?: Array<{
    month: string;
    score: number;
  }>;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  overallScore = 68,
  overallAccuracy = 72,
  overallSpeed = 45,
  testsCompleted = 12,
  questionsAnswered = 480,
  improvementRate = 8.5,
  monthlyPerformance = [
    { month: "Jan", score: 78 },
    { month: "Feb", score: 73 },
    { month: "Mar", score: 90 },
    { month: "Apr", score: 58 },
    { month: "May", score: 85 },
    { month: "Jun", score: 68 },
    { month: "Jul", score: 78 },
    { month: "Aug", score: 82 },
    { month: "Sep", score: 90 },
    { month: "Oct", score: 78 },
    { month: "Nov", score: 85 },
    { month: "Dec", score: 92 },
  ],
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
  const [activeSubject, setActiveSubject] = useState("Mathematics");

  // Colors for the radial charts
  const COLORS = {
    Mathematics: "#4ade80", // Green
    English: "#93c5fd", // Blue
    Physics: "#fcd34d", // Yellow
    Chemistry: "#f9a8d4", // Pink
  };

  // Prepare data for radial charts
  const radialChartData = subjectPerformance.map((subject) => ({
    name: subject.subject,
    value: subject.score,
    color: COLORS[subject.subject as keyof typeof COLORS],
    shortName: subject.subject.substring(0, 4),
  }));

  return (
    <div className="w-full bg-background p-4 rounded-xl">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Performance Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-bold">{overallScore}%</div>
              <div className="flex items-center text-xs sm:text-sm text-green-500">
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {improvementRate}%
                <span className="text-muted-foreground ml-1 hidden sm:inline">
                  vs last month
                </span>
              </div>
            </div>
            <Progress value={overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-bold">{overallAccuracy}%</div>
              <div className="flex items-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {questionsAnswered} questions answered
            </div>
            <Progress value={overallAccuracy} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-bold">{overallSpeed}s</div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-1" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              per question across {testsCompleted} tests
            </div>
            <Progress
              value={100 - (overallSpeed / 90) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="flex flex-nowrap overflow-x-auto w-full mb-4 justify-start">
          <TabsTrigger value="subjects" className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">Subject Performance</TabsTrigger>
          <TabsTrigger value="trends" className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">Performance Trends</TabsTrigger>
          <TabsTrigger value="weak-areas" className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">Weak Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-2 sm:space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:gap-4">
            <Card className="w-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg sm:text-xl">Subject-wise Performance</CardTitle>
                <CardDescription className="text-sm">Your performance across different subjects</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-6">
                  {subjectPerformance.map((subject) => (
                    <Card key={subject.subject} className="w-full">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base sm:text-lg">{subject.subject}</CardTitle>
                          <Badge
                            variant={
                              subject.score >= 70 ? "default" : "outline"
                            }
                            className="text-xs sm:text-sm"
                          >
                            {subject.score}%
                          </Badge>
                        </div>
                        <CardDescription className="text-xs sm:text-sm">
                          Accuracy: {subject.accuracy}% | Speed: {subject.speed}
                          s per question
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <h4 className="text-sm font-semibold mb-2">Weak Topics:</h4>
                        <div className="space-y-1 sm:space-y-2">
                          {subject.weakTopics.map((topic) => (
                            <div
                              key={topic.name}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                                <span className="text-xs sm:text-sm">{topic.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  topic.score < 50 ? "text-red-500" : "text-amber-500"
                                }
                              >
                                {topic.score}%
                              </Badge>
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
        </TabsContent>

        <TabsContent value="trends" className="py-2">
          <Card className="w-full">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg sm:text-xl">Performance Trends</CardTitle>
              <CardDescription className="text-sm">
                Your performance over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[250px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPerformance}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" className="text-xs sm:text-sm" />
                    <YAxis domain={[0, 100]} className="text-xs sm:text-sm" />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Score"]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                      }}
                      labelStyle={{ fontSize: '0.75rem' }}
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

        <TabsContent value="weak-areas" className="py-2">
          <Card className="w-full">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg sm:text-xl">Areas Needing Improvement</CardTitle>
              <CardDescription className="text-sm">
                Focus on these topics to improve your overall score
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 sm:space-y-4">
                {subjectPerformance
                  .flatMap((subject) =>
                    subject.weakTopics.map((topic) => ({
                      subject: subject.subject,
                      topic: topic.name,
                      score: topic.score,
                    })),
                  )
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium text-sm sm:text-base">{item.topic}</span>
                          <span className="text-muted-foreground text-xs sm:text-sm ml-2">
                            ({item.subject})
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            item.score < 50 ? "text-red-500 text-xs sm:text-sm" : "text-amber-500 text-xs sm:text-sm"
                          }
                        >
                          {item.score}%
                        </Badge>
                      </div>
                      <Progress value={item.score} className="h-2" />
                      {index < 4 && <Separator className="mt-2 sm:mt-4" />}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceOverview;
