import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  BookOpen,
  Trophy,
  Clock,
  BarChart3,
  BookMarked,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import PerformanceOverview from "./PerformanceOverview";
import RecommendationPanel from "./RecommendationPanel";
import NewTestDialog from "./NewTestDialog";
import Layout from "@/components/common/Layout";
import { useDashboard } from "../hooks/useDashboard";
import { LeaderboardTable } from "@/features/leaderboard/ui/LeaderboardTable";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
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
    avgScore,
    preparing,
    prepError,
    setPrepError,
    showPreparedDialog,
    handlePrepareTest,
    handleGoToTest,
  } = useDashboard();

  const parseTimeToSeconds = (timeStr: string) => {
    if (!timeStr) return "-";
    const [h, m, s] = timeStr.split(":");
    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    const seconds = Math.round(parseFloat(s));
    let result = [];
    if (hours > 0) result.push(`${hours}hr`);
    if (minutes > 0) result.push(`${minutes}m`);
    result.push(`${seconds}s`);
    return result.join(" ");
  };

  const quickStats = [
    {
      label: "Tests Taken",
      value: user?.totalNumberOfTestTaken ?? 0,
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Avg. Score",
      value: `${avgScore}%`,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Rank",
      value: user?.hasJoinedLeaderboard && user?.rank ? `#${user.rank}` : "-",
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      label: "Avg. Speed",
      value: user?.totalAverageSpeed ? parseTimeToSeconds(user.totalAverageSpeed) : "-",
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  if (userLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  if (userError) {
    return <div className="flex justify-center items-center h-screen text-red-500">{userError}</div>;
  }

  return (
    <Layout
      title="Dashboard"
      headerActions={
        <>
          <NewTestDialog onStart={handlePrepareTest}>
            <Button>
              Start New Practice Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </NewTestDialog>
          {!user?.hasJoinedLeaderboard && (
            <Button variant="secondary">Join Leaderboard</Button>
          )}
        </>
      }
    >
      {preparing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-lg font-semibold mb-2">Preparing Questions...</div>
            <div className="text-muted-foreground">Please wait while we prepare your test.</div>
          </div>
        </div>
      )}
      {prepError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-lg font-semibold mb-2 text-red-600">{prepError}</div>
            <Button onClick={() => setPrepError("")}>Close</Button>
          </div>
        </div>
      )}
      {showPreparedDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
            <Button className="mt-4" onClick={handleGoToTest}>
              Go To Test
            </Button>
          </div>
        </div>
      )}

      <section className="mb-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName ?? "User"}
          </p>
          <h2 className="text-3xl font-bold">Track your progress</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Your performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectsPerformanceLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))
                ) : subjectsPerformanceError ? (
                  <p className="text-red-500">{subjectsPerformanceError}</p>
                ) : subjectsPerformance && subjectsPerformance.length > 0 ? (
                  subjectsPerformance.map((subject, index) => {
                    const roundedPercent = Math.round(subject.percentage);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{subject.subjectName.charAt(0).toUpperCase() + subject.subjectName.slice(1)}</span>
                          <span className="font-medium">{roundedPercent}%</span>
                        </div>
                        <Progress value={roundedPercent} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No subjects found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
              <CardDescription>Your most recent practice tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTestsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))
                ) : recentTestsError ? (
                  <p className="text-red-500">{recentTestsError}</p>
                ) : recentTests.length > 0 ? (
                  recentTests.slice(0, 5).map((test) => (
                    <div key={test.testId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <BookMarked className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">
                            <span className="flex flex-wrap gap-1">
                              {test.subjects.map((subject, idx) => (
                                <Badge key={idx} variant="outline">{subject.name}</Badge>
                              ))}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(test.dateTaken).toLocaleDateString()} • {test.subjects.length * 40} questions • Standard
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={(() => {
                            const totalScore = test.subjects.reduce((acc, s) => acc + s.score, 0);
                            return totalScore >= 250 ? "default" : "outline";
                          })()}
                        >
                          {(() => {
                            const totalScore = test.subjects.reduce((acc, s) => acc + s.score, 0);
                            return `${Math.round(totalScore)}`;
                          })()}
                        </Badge>
                        <Button variant="ghost" size="sm">Review</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent tests found.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Tests</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="performance">
          <PerformanceOverview />
        </TabsContent>
        <TabsContent value="leaderboard">
          <LeaderboardTable />
        </TabsContent>
        <TabsContent value="recommendations">
          <RecommendationPanel userName={user?.firstName} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default DashboardPage; 