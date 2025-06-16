import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

import PerformanceOverview from "./Dashboard/PerformanceOverview";
import LeaderboardTable from "./Leaderboard/LeaderboardTable";
import RecommendationPanel from "./Study/RecommendationPanel";
import NewTestDialog from "./NewTestDialog";
import Layout from "./common/Layout";
import api from "../lib/apiConfig";

const Home = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subjectsPerformance, setSubjectsPerformance] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const navigate = useNavigate();
  const [preparing, setPreparing] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [cbtSessionId, setCbtSessionId] = useState<string | null>(null);
  const [testConfig, setTestConfig] = useState<any>(null);
  const [showPreparedDialog, setShowPreparedDialog] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/signin";
        return;
      }
      try {
        const res = await api.get("/api/v1/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.isSuccess && res.data.value) {
          setUser({
            ...res.data.value,
            studentId: res.data.value.studentId?.value || res.data.value.studentId,
          });
        } else {
          setError(res.data?.message || "Failed to fetch user profile");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch recent tests after user is loaded
  useEffect(() => {
    const fetchRecentTests = async () => {
      const token = localStorage.getItem("token");
      if (!user?.studentId || !token) return;
      try {
        const res = await api.get("/api/v1/dashboard/students/test-performance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.isSuccess && res.data.value?.subjectTestPerformances) {
          const subjectTestPerformances = res.data.value.subjectTestPerformances;
          // Pivot the data: group by testId
          const testMap: Record<string, any> = {};
          Object.entries(subjectTestPerformances).forEach(([subject, tests]) => {
            (tests as any[]).forEach((test) => {
              if (!testMap[test.testId]) {
                testMap[test.testId] = {
                  testId: test.testId,
                  dateTaken: test.dateTaken,
                  subjects: [],
                };
              }
              testMap[test.testId].subjects.push({ name: subject.charAt(0).toUpperCase() + subject.slice(1), score: test.score });
            });
          });
          // Convert to array and sort by dateTaken desc
          const testsArr = Object.values(testMap).sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
          setRecentTests(testsArr);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchRecentTests();
  }, [user?.studentId]);

  // Calculate average score as per formula
  let avgScore = 0;
  if (user && user.totalScore && user.totalNumberOfTestTaken) {
    avgScore = (user.totalScore / (user.totalNumberOfTestTaken * 400)) * 100;
    avgScore = Math.round(avgScore); // round to whole number
  }

  // Function to parse time string and return formatted time
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

  useEffect(() => {
    const fetchSubjectPerformance = async () => {
      const token = localStorage.getItem("token");
      if (!user?.studentId || !token) return;
      try {
        const res = await api.get(`/api/v1/dashboard/students/aggregate-performance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data?.isSuccess && res.data.value?.subjectsPerformanceAnalysis) {
          setSubjectsPerformance(res.data.value.subjectsPerformanceAnalysis);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchSubjectPerformance();
  }, [user?.studentId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <Layout
      title="Dashboard"
      headerActions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center w-full sm:w-auto">
          <NewTestDialog
            onStart={async (opts) => {
              setPreparing(true);
              setPrepError("");
              setCbtSessionId(null);
              setTestConfig(null);
              try {
                const token = localStorage.getItem("token");
                const res = await api.post(
                  "/api/v1/question/standered",
                  opts,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data?.isSuccess && res.data.value?.cbtSessionId) {
                  setCbtSessionId(res.data.value.cbtSessionId);
                  setShowPreparedDialog(true);
                } else {
                  setPrepError(res.data?.message || "Failed to prepare questions");
                }
              } catch (err) {
                setPrepError(err.response?.data?.message || err.message || "Failed to prepare questions");
              } finally {
                setPreparing(false);
              }
            }}
          >
            <Button className="w-full sm:w-auto text-sm sm:text-base">
              Start New Practice Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </NewTestDialog>
          {!user?.hasJoinedLeaderboard && (
            <Button variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
              Join Leaderboard
            </Button>
          )}
        </div>
      }
    >
      {/* Loading Dialog for Preparing Questions */}
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
      {showPreparedDialog && cbtSessionId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
            <Button
              className="mt-4"
              onClick={async () => {
                setPreparing(true);
                setPrepError("");
                try {
                  const token = localStorage.getItem("token");
                  const res = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.data?.isSuccess && res.data.value) {
                    setTestConfig(res.data.value);
                    setShowPreparedDialog(false);
                    // Navigate to test interface with config
                    navigate("/practice/test", {
                      state: {
                        cbtSessionId: res.data.value.cbtSessionId,
                        preparedQuestion: res.data.value.preparedQuestion,
                        examConfig: {
                          time: res.data.value.duration,
                          questions: res.data.value.totalQuestionsCount,
                        },
                        status: (() => {
                          switch (res.data.value.status) {
                            case 1: return "not-started";
                            case 2: return "in-progress";
                            case 3: return "submitted";
                            case 4: return "cancelled";
                            default: return "not-started";
                          }
                        })(),
                      },
                    });
                  } else {
                    setPrepError(res.data?.message || "Failed to fetch test configuration");
                  }
                } catch (err) {
                  setPrepError(err.response?.data?.message || err.message || "Failed to fetch test configuration");
                } finally {
                  setPreparing(false);
                }
              }}
            >
              Go To Test
            </Button>
          </div>
        </div>
      )}
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back, {user?.firstName ?? "User"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold">Track your progress</h2>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card w-full">
              <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 mb-1 sm:mb-2">
                  {stat.icon}
                </div>
                <p className="text-base sm:text-lg md:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Main Dashboard Tabs */}
      <div className="overflow-x-auto no-scrollbar">
        <Tabs defaultValue="overview" className="w-full min-w-[320px] sm:min-w-0">
          <TabsList className="flex-nowrap overflow-x-auto no-scrollbar w-full justify-start">
            <TabsTrigger value="overview" className="whitespace-nowrap text-xs sm:text-base px-2 sm:px-3">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="whitespace-nowrap text-xs sm:text-base px-2 sm:px-3">Performance</TabsTrigger>
            <TabsTrigger value="leaderboard" className="whitespace-nowrap text-xs sm:text-base px-2 sm:px-3">Leaderboard</TabsTrigger>
            <TabsTrigger value="recommendations" className="whitespace-nowrap text-xs sm:text-base px-2 sm:px-3">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="py-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Tests</CardTitle>
                <CardDescription className="text-sm">Your latest practice test results.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:gap-4">
                  {recentTests.length > 0 ? (
                    recentTests.slice(0, 5).map((test) => (
                      <div key={test.testId} className="flex flex-col xs:flex-row justify-between items-start xs:items-center pb-2 xs:pb-4 last:pb-0 border-b last:border-b-0 gap-1 xs:gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none">{new Date(test.dateTaken).toLocaleDateString()}</p>
                          <p className="text-muted-foreground text-xs">
                            {test.subjects.map((s: any) => s.name).join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={(() => {
                              const totalScore = test.subjects.reduce((acc: number, s: any) => acc + s.score, 0);
                              return totalScore >= 250 ? "default" : "outline";
                            })()}
                            className="text-xs sm:text-sm"
                          >
                            {(() => {
                              const totalScore = test.subjects.reduce((acc: number, s: any) => acc + s.score, 0);
                              return `${Math.round(totalScore)}`;
                            })()}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No recent tests found.</p>
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
            <RecommendationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Home;
