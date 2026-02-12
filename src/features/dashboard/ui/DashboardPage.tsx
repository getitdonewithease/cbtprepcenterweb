import { useState, useEffect, useRef } from "react";
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
  Calendar,
  Tag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

import PerformanceOverview from "./PerformanceOverview";
import RecommendationPanel from "./RecommendationPanel";
import NewTestDialog from "./NewTestDialog";
import Layout from "@/components/common/Layout";
import { useDashboard } from "../hooks/useDashboard";
import { PracticeTestType } from "../types/dashboardTypes";
import { LeaderboardTable } from "@/features/leaderboard/ui/LeaderboardTable";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [preparingDialogOpen, setPreparingDialogOpen] = useState(true);
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
    avgScore,
    preparing,
    showPreparedDialog,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
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
      label: "Tests Completed",
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

  const showPreparingDialog = preparing && preparingDialogOpen;

  return (
    <Layout
      title="Dashboard"
      headerActions={
        <>
          <NewTestDialog onStart={handlePrepareTest} subjects={user?.courses || []}>
            <Button>
              Start New Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </NewTestDialog>
          {/* {!user?.hasJoinedLeaderboard && (
            <Button variant="secondary">Join Leaderboard</Button>
          )} */}
        </>
      }
    >
      {userLoading ? (
        <div className="flex justify-center items-center h-full min-h-[400px]">Loading...</div>
      ) : userError ? (
        <div className="flex justify-center items-center h-full min-h-[400px] text-red-500">{userError}</div>
      ) : (
        <>
          {showPreparingDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white p-8 rounded shadow text-center">
                <div className="text-lg font-semibold mb-2">Preparing Questions...</div>
                <div className="text-muted-foreground mb-4">Please wait while we prepare your test.</div>
                <Button variant="outline" onClick={() => setPreparingDialogOpen(false)}>
                  Continue in background
                </Button>
              </div>
            </div>
          )}
          {showPreparedDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white p-8 rounded shadow text-center">
                <div className="text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
                <div className="flex flex-col gap-2 mt-4">
                  <Button className="w-full" onClick={handleGoToTest}>
                    Go To Test
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setShowPreparedDialog(false)}>
                    Close
                  </Button>
                </div>
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
              {/* <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger> */}
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

              <div className="my-6" />

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
                      recentTests.slice(0, 5).map((test) => {
                        const percentage = Math.round(test.totalScorePercentage || 0);
                        const scoreClassName =
                          percentage >= 80
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : percentage >= 60
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-red-100 text-red-700 border-red-200";
                        return (
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
                                <div className="mt-1 flex flex-wrap gap-2">
                                  <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(test.dateTaken).toLocaleDateString()}
                                  </Badge>
                                  <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal gap-1">
                                    <Tag className="h-3 w-3" />
                                    {PracticeTestType[test.practiceTestType]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Badge className={`px-2 py-1 text-xs sm:text-sm font-medium ${scoreClassName}`}>
                                {percentage}%
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/practice/review/${test.testId}`)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        );
                      })
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
              <PerformanceOverview
                recentTests={recentTests}
                topicConfidences={topicConfidences}
                topicConfidencesLoading={topicConfidencesLoading}
                topicConfidencesError={topicConfidencesError}
              />
            </TabsContent>
            <TabsContent value="leaderboard">
              <LeaderboardTable />
            </TabsContent>
            <TabsContent value="recommendations">
              <RecommendationPanel userName={user?.firstName} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;