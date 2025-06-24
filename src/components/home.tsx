// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import {
//   ChevronRight,
//   BookOpen,
//   Trophy,
//   Clock,
//   BarChart3,
//   BookMarked,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// import PerformanceOverview from "./Dashboard/PerformanceOverview";
// import LeaderboardTable from "./Leaderboard/LeaderboardTable";
// import RecommendationPanel from "./Study/RecommendationPanel";
// import NewTestDialog from "./NewTestDialog";
// import Layout from "./common/Layout";
// import api from "../lib/apiConfig";

// const Home = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [subjectsPerformance, setSubjectsPerformance] = useState<any[]>([]);
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [recentTests, setRecentTests] = useState<any[]>([]);
//   const navigate = useNavigate();
//   const [preparing, setPreparing] = useState(false);
//   const [prepError, setPrepError] = useState("");
//   const [cbtSessionId, setCbtSessionId] = useState<string | null>(null);
//   const [testConfig, setTestConfig] = useState<any>(null);
//   const [showPreparedDialog, setShowPreparedDialog] = useState(false);

//   // Fetch user profile on mount
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         window.location.href = "/signin";
//         return;
//       }
//       try {
//         const res = await api.get("/api/v1/students/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.data?.isSuccess && res.data.value) {
//           setUser({
//             ...res.data.value,
//             studentId: res.data.value.studentId?.value || res.data.value.studentId,
//           });
//         } else {
//           setError(res.data?.message || "Failed to fetch user profile");
//         }
//       } catch (err: any) {
//         setError(err.response?.data?.message || err.message || "Failed to fetch user profile");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUserProfile();
//   }, []);

//   // Fetch recent tests after user is loaded
//   useEffect(() => {
//     const fetchRecentTests = async () => {
//       const token = localStorage.getItem("token");
//       if (!user?.studentId || !token) return;
//       try {
//         const res = await api.get("/api/v1/dashboard/students/test-performance", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.data?.isSuccess && res.data.value?.subjectTestPerformances) {
//           const subjectTestPerformances = res.data.value.subjectTestPerformances;
//           // Pivot the data: group by testId
//           const testMap: Record<string, any> = {};
//           Object.entries(subjectTestPerformances).forEach(([subject, tests]) => {
//             (tests as any[]).forEach((test) => {
//               if (!testMap[test.testId]) {
//                 testMap[test.testId] = {
//                   testId: test.testId,
//                   dateTaken: test.dateTaken,
//                   subjects: [],
//                 };
//               }
//               testMap[test.testId].subjects.push({ name: subject.charAt(0).toUpperCase() + subject.slice(1), score: test.score });
//             });
//           });
//           // Convert to array and sort by dateTaken desc
//           const testsArr = Object.values(testMap).sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
//           setRecentTests(testsArr);
//         }
//       } catch (err) {
//         // Optionally handle error
//       }
//     };
//     fetchRecentTests();
//   }, [user?.studentId]);

//   // Calculate average score as per formula
//   let avgScore = 0;
//   if (user && user.totalScore && user.totalNumberOfTestTaken) {
//     avgScore = (user.totalScore / (user.totalNumberOfTestTaken * 400)) * 100;
//     avgScore = Math.round(avgScore); // round to whole number
//   }

//   // Function to parse time string and return formatted time
//   const parseTimeToSeconds = (timeStr: string) => {
//     if (!timeStr) return "-";
//     const [h, m, s] = timeStr.split(":");
//     const hours = parseInt(h, 10);
//     const minutes = parseInt(m, 10);
//     const seconds = Math.round(parseFloat(s));
//     let result = [];
//     if (hours > 0) result.push(`${hours}hr`);
//     if (minutes > 0) result.push(`${minutes}m`);
//     result.push(`${seconds}s`);
//     return result.join(" ");
//   };

//   const quickStats = [
//     {
//       label: "Tests Taken",
//       value: user?.totalNumberOfTestTaken ?? 0,
//       icon: <BookOpen className="h-4 w-4" />,
//     },
//     {
//       label: "Avg. Score",
//       value: `${avgScore}%`,
//       icon: <BarChart3 className="h-4 w-4" />,
//     },
//     {
//       label: "Rank",
//       value: user?.hasJoinedLeaderboard && user?.rank ? `#${user.rank}` : "-",
//       icon: <Trophy className="h-4 w-4" />,
//     },
//     {
//       label: "Avg. Speed",
//       value: user?.totalAverageSpeed ? parseTimeToSeconds(user.totalAverageSpeed) : "-",
//       icon: <Clock className="h-4 w-4" />,
//     },
//   ];

//   useEffect(() => {
//     const fetchSubjectPerformance = async () => {
//       const token = localStorage.getItem("token");
//       if (!user?.studentId || !token) return;
//       try {
//         const res = await api.get(`/api/v1/dashboard/students/aggregate-performance`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (res.data?.isSuccess && res.data.value?.subjectsPerformanceAnalysis) {
//           setSubjectsPerformance(res.data.value.subjectsPerformanceAnalysis);
//         }
//       } catch (err) {
//         // Optionally handle error
//       }
//     };
//     fetchSubjectPerformance();
//   }, [user?.studentId]);

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }
//   if (error) {
//     return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
//   }

//   return (
//     <Layout
//       title="Dashboard"
//       headerActions={
//         <>
//           <NewTestDialog
//             onStart={async (opts) => {
//               setPreparing(true);
//               setPrepError("");
//               setCbtSessionId(null);
//               setTestConfig(null);
//               try {
//                 const token = localStorage.getItem("token");
//                 const res = await api.post(
//                   "/api/v1/question/standered",
//                   opts,
//                   { headers: { Authorization: `Bearer ${token}` } }
//                 );
//                 if (res.data?.isSuccess && res.data.value?.cbtSessionId) {
//                   setCbtSessionId(res.data.value.cbtSessionId);
//                   setShowPreparedDialog(true);
//                 } else {
//                   setPrepError(res.data?.message || "Failed to prepare questions");
//                 }
//               } catch (err) {
//                 setPrepError(err.response?.data?.message || err.message || "Failed to prepare questions");
//               } finally {
//                 setPreparing(false);
//               }
//             }}
//           >
//             <Button>
//               Start New Practice Test
//               <ChevronRight className="ml-2 h-4 w-4" />
//             </Button>
//           </NewTestDialog>
//           {!user?.hasJoinedLeaderboard && (
//             <Button variant="secondary">
//               Join Leaderboard
//             </Button>
//           )}
//         </>
//       }
//     >
//       {/* Loading Dialog for Preparing Questions */}
//       {preparing && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//           <div className="bg-white p-8 rounded shadow text-center">
//             <div className="text-lg font-semibold mb-2">Preparing Questions...</div>
//             <div className="text-muted-foreground">Please wait while we prepare your test.</div>
//           </div>
//         </div>
//       )}
//       {prepError && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//           <div className="bg-white p-8 rounded shadow text-center">
//             <div className="text-lg font-semibold mb-2 text-red-600">{prepError}</div>
//             <Button onClick={() => setPrepError("")}>Close</Button>
//           </div>
//         </div>
//       )}
//       {showPreparedDialog && cbtSessionId && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//           <div className="bg-white p-8 rounded shadow text-center">
//             <div className="text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
//             <Button
//               className="mt-4"
//               onClick={async () => {
//                 setPreparing(true);
//                 setPrepError("");
//                 try {
//                   const token = localStorage.getItem("token");
//                   const res = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                   });
//                   if (res.data?.isSuccess && res.data.value) {
//                     setTestConfig(res.data.value);
//                     setShowPreparedDialog(false);
//                     // Navigate to test interface with config
//                     navigate("/practice/test", {
//                       state: {
//                         cbtSessionId: res.data.value.cbtSessionId,
//                         preparedQuestion: res.data.value.preparedQuestion,
//                         examConfig: {
//                           time: res.data.value.duration,
//                           questions: res.data.value.totalQuestionsCount,
//                         },
//                         status: (() => {
//                           switch (res.data.value.status) {
//                             case 1: return "not-started";
//                             case 2: return "in-progress";
//                             case 3: return "submitted";
//                             case 4: return "cancelled";
//                             default: return "not-started";
//                           }
//                         })(),
//                       },
//                     });
//                   } else {
//                     setPrepError(res.data?.message || "Failed to fetch test configuration");
//                   }
//                 } catch (err) {
//                   setPrepError(err.response?.data?.message || err.message || "Failed to fetch test configuration");
//                 } finally {
//                   setPreparing(false);
//                 }
//               }}
//             >
//               Go To Test
//             </Button>
//           </div>
//         </div>
//       )}
//       {/* Welcome Section */}
//       <section className="mb-8">
//         <div className="mb-6">
//           <p className="text-muted-foreground">
//             Welcome back, {user?.firstName ?? "User"}
//           </p>
//           <h2 className="text-3xl font-bold">Track your progress</h2>
//         </div>
//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {quickStats.map((stat, index) => (
//             <Card key={index} className="bg-card">
//               <CardContent className="p-4 flex flex-col items-center justify-center text-center">
//                 <div className="rounded-full bg-primary/10 p-3 mb-2">
//                   {stat.icon}
//                 </div>
//                 <p className="text-2xl font-bold">{stat.value}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {stat.label}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>
//       {/* Main Dashboard Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           <TabsTrigger value="performance">Performance</TabsTrigger>
//           <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
//           <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
//         </TabsList>
//         <TabsContent value="overview">
//           {/* Subject Progress */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Subject Progress</CardTitle>
//               <CardDescription>
//                 Your performance across all subjects
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {/* Show subject performance from API */}
//                 {subjectsPerformance && subjectsPerformance.length > 0 ? (
//                   subjectsPerformance.map((subject, index) => {
//                     const roundedPercent = Math.round(subject.percentage);
//                     return (
//                       <div key={index} className="space-y-1">
//                         <div className="flex justify-between text-sm">
//                           <span>{subject.subjectName.charAt(0).toUpperCase() + subject.subjectName.slice(1)}</span>
//                           <span className="font-medium">
//                             {roundedPercent}%
//                           </span>
//                         </div>
//                         <Progress
//                           value={roundedPercent}
//                           className="h-2"
//                         />
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <p className="text-muted-foreground">No subjects found.</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Recent Tests */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Tests</CardTitle>
//               <CardDescription>
//                 Your most recent practice tests
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {recentTests.length > 0 ? (
//                   recentTests.slice(0, 5).map((test) => (
//                     <div
//                       key={test.testId}
//                       className="flex items-center justify-between p-3 border rounded-lg"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="rounded-full bg-primary/10 p-2">
//                           <BookMarked className="h-4 w-4" />
//                         </div>
//                         <div>
//                           <p className="font-medium">
//                             <span className="flex flex-wrap gap-1">
//                               {test.subjects.map((subject: any, idx: number) => (
//                                 <Badge key={idx} variant="outline">{subject.name}</Badge>
//                               ))}
//                             </span>
//                           </p>
//                           <p className="text-xs text-muted-foreground">
//                             {new Date(test.dateTaken).toLocaleDateString()} • {test.subjects.length * 40} questions • Standard
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <Badge
//                           variant={(() => {
//                             const totalScore = test.subjects.reduce((acc: number, s: any) => acc + s.score, 0);
//                             return totalScore >= 250 ? "default" : "outline"; // 70% of 400 = 280
//                           })()}
//                         >
//                           {(() => {
//                             const totalScore = test.subjects.reduce((acc: number, s: any) => acc + s.score, 0);
//                             return `${Math.round(totalScore)}`;
//                           })()}
//                         </Badge>
//                         <Button variant="ghost" size="sm">
//                           Review
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-muted-foreground">No recent tests found.</p>
//                 )}
//               </div>
//             </CardContent>
//             <CardFooter>
//               <Button variant="outline" className="w-full">
//                 View All Tests
//               </Button>
//             </CardFooter>
//           </Card>
//         </TabsContent>
//         <TabsContent value="performance">
//           <PerformanceOverview />
//         </TabsContent>
//         <TabsContent value="leaderboard">
//           <LeaderboardTable />
//         </TabsContent>
//         <TabsContent value="recommendations">
//           <RecommendationPanel />
//         </TabsContent>
//       </Tabs>
//     </Layout>
//   );
// };

// export default Home;
