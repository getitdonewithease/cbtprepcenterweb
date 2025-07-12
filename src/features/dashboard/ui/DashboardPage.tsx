// import { useState, useEffect, useRef } from "react";
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
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "@/components/ui/use-toast";

// import PerformanceOverview from "./PerformanceOverview";
// import RecommendationPanel from "./RecommendationPanel";
// import NewTestDialog from "./NewTestDialog";
// import Layout from "@/components/common/Layout";
// import { useDashboard } from "../hooks/useDashboard";
// import { LeaderboardTable } from "@/features/leaderboard/ui/LeaderboardTable";

// const DashboardPage = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [preparingDialogOpen, setPreparingDialogOpen] = useState(true);
//   const {
//     user,
//     userLoading,
//     userError,
//     recentTests,
//     recentTestsLoading,
//     recentTestsError,
//     subjectsPerformance,
//     subjectsPerformanceLoading,
//     subjectsPerformanceError,
//     avgScore,
//     preparing,
//     prepError,
//     setPrepError,
//     showPreparedDialog,
//     handlePrepareTest,
//     handleGoToTest,
//     setShowPreparedDialog,
//   } = useDashboard();

//   const wasPreparing = useRef(false);
//   useEffect(() => {
//     if (wasPreparing.current && !preparing && !showPreparedDialog && !prepError && !preparingDialogOpen) {
//       toast({
//         title: "Questions Ready!",
//         description: "Your practice test is ready to start.",
//       });
//     }
//     wasPreparing.current = preparing;
//   }, [preparing, showPreparedDialog, prepError, preparingDialogOpen]);

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
//       label: "Tests Completed",
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

//   const showPreparingDialog = preparing && preparingDialogOpen;

//   return (
//     <Layout
//       title="Dashboard"
//       headerActions={
//         <>
//           <NewTestDialog onStart={handlePrepareTest} subjects={user?.courses || []}>
//             <Button>
//               Start New Practice Test
//               <ChevronRight className="ml-2 h-4 w-4" />
//             </Button>
//           </NewTestDialog>
//           {!user?.hasJoinedLeaderboard && (
//             <Button variant="secondary">Join Leaderboard</Button>
//           )}
//         </>
//       }
//     >
//       {userLoading ? (
//         <div className="flex justify-center items-center h-full min-h-[400px]">Loading...</div>
//       ) : userError ? (
//         <div className="flex justify-center items-center h-full min-h-[400px] text-red-500">{userError}</div>
//       ) : (
//         <>
//           {showPreparingDialog && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//               <div className="bg-white p-8 rounded shadow text-center">
//                 <div className="text-lg font-semibold mb-2">Preparing Questions...</div>
//                 <div className="text-muted-foreground mb-4">Please wait while we prepare your test.</div>
//                 <Button variant="outline" onClick={() => setPreparingDialogOpen(false)}>
//                   Continue in background
//                 </Button>
//               </div>
//             </div>
//           )}
//           {prepError && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//               <div className="bg-white p-8 rounded shadow text-center">
//                 <div className="text-lg font-semibold mb-2 text-red-600">{prepError}</div>
//                 <Button onClick={() => setPrepError("")}>Close</Button>
//               </div>
//             </div>
//           )}
//           {showPreparedDialog && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
//               <div className="bg-white p-8 rounded shadow text-center">
//                 <div className="text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
//                 <div className="flex flex-col gap-2 mt-4">
//                   <Button className="w-full" onClick={handleGoToTest}>
//                     Go To Test
//                   </Button>
//                   <Button className="w-full" variant="outline" onClick={() => setShowPreparedDialog(false)}>
//                     Close
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           <section className="mb-8">
//             <div className="mb-6">
//               <p className="text-muted-foreground">
//                 Welcome back, {user?.firstName ?? "User"}
//               </p>
//               <h2 className="text-3xl font-bold">Track your progress</h2>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {quickStats.map((stat, index) => (
//                 <Card key={index} className="bg-card">
//                   <CardContent className="p-4 flex flex-col items-center justify-center text-center">
//                     <div className="rounded-full bg-primary/10 p-3 mb-2">
//                       {stat.icon}
//                     </div>
//                     <p className="text-2xl font-bold">{stat.value}</p>
//                     <p className="text-sm text-muted-foreground">{stat.label}</p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </section>

//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="mb-4">
//               <TabsTrigger value="overview">Overview</TabsTrigger>
//               <TabsTrigger value="performance">Performance</TabsTrigger>
//               {/* <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger> */}
//               {/* <TabsTrigger value="recommendations">Recommendations</TabsTrigger> */}
//             </TabsList>
//             <TabsContent value="overview">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Subject Progress</CardTitle>
//                   <CardDescription>Your performance across all subjects</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {subjectsPerformanceLoading ? (
//                       Array.from({ length: 3 }).map((_, index) => (
//                         <div key={index} className="space-y-2">
//                           <Skeleton className="h-4 w-1/4" />
//                           <Skeleton className="h-2 w-full" />
//                         </div>
//                       ))
//                     ) : subjectsPerformanceError ? (
//                       <p className="text-red-500">{subjectsPerformanceError}</p>
//                     ) : subjectsPerformance && subjectsPerformance.length > 0 ? (
//                       subjectsPerformance.map((subject, index) => {
//                         const roundedPercent = Math.round(subject.percentage);
//                         return (
//                           <div key={index} className="space-y-1">
//                             <div className="flex justify-between text-sm">
//                               <span>{subject.subjectName.charAt(0).toUpperCase() + subject.subjectName.slice(1)}</span>
//                               <span className="font-medium">{roundedPercent}%</span>
//                             </div>
//                             <Progress value={roundedPercent} className="h-2" />
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <p className="text-muted-foreground">No subjects found.</p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               <div className="my-6" />

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Tests</CardTitle>
//                   <CardDescription>Your most recent practice tests</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {recentTestsLoading ? (
//                       Array.from({ length: 3 }).map((_, index) => (
//                         <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                           <div className="flex items-center gap-3">
//                             <Skeleton className="h-10 w-10 rounded-full" />
//                             <div className="space-y-2">
//                               <Skeleton className="h-4 w-[250px]" />
//                               <Skeleton className="h-4 w-[200px]" />
//                             </div>
//                           </div>
//                           <Skeleton className="h-8 w-16" />
//                         </div>
//                       ))
//                     ) : recentTestsError ? (
//                       <p className="text-red-500">{recentTestsError}</p>
//                     ) : recentTests.length > 0 ? (
//                       recentTests.slice(0, 5).map((test) => (
//                         <div key={test.testId} className="flex items-center justify-between p-3 border rounded-lg">
//                           <div className="flex items-center gap-3">
//                             <div className="rounded-full bg-primary/10 p-2">
//                               <BookMarked className="h-4 w-4" />
//                             </div>
//                             <div>
//                               <p className="font-medium">
//                                 <span className="flex flex-wrap gap-1">
//                                   {test.subjects.map((subject, idx) => (
//                                     <Badge key={idx} variant="outline">{subject.name}</Badge>
//                                   ))}
//                                 </span>
//                               </p>
//                               <p className="text-xs text-muted-foreground">
//                                 {new Date(test.dateTaken).toLocaleDateString()} • {test.subjects.length * 40} questions • Standard
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <Badge
//                               variant={(() => {
//                                 const totalScore = test.subjects.reduce((acc, s) => acc + s.score, 0);
//                                 return totalScore >= 250 ? "default" : "outline";
//                               })()}
//                             >
//                               {(() => {
//                                 const totalScore = test.subjects.reduce((acc, s) => acc + s.score, 0);
//                                 return `${Math.round(totalScore)}`;
//                               })()}
//                             </Badge>
//                             <Button variant="ghost" size="sm">Review</Button>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-muted-foreground">No recent tests found.</p>
//                     )}
//                   </div>
//                 </CardContent>
//                 <CardFooter>
//                   <Button variant="outline" className="w-full">View All Tests</Button>
//                 </CardFooter>
//               </Card>
//             </TabsContent>
//             <TabsContent value="performance">
//               <PerformanceOverview recentTests={recentTests} />
//             </TabsContent>
//             <TabsContent value="leaderboard">
//               <LeaderboardTable />
//             </TabsContent>
//             <TabsContent value="recommendations">
//               <RecommendationPanel userName={user?.firstName} />
//             </TabsContent>
//           </Tabs>
//         </>
//       )}
//     </Layout>
//   );
// };

// export default DashboardPage;
























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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { toast } from "@/components/ui/use-toast";

import PerformanceOverview from "./PerformanceOverview";
import RecommendationPanel from "./RecommendationPanel";
import NewTestDialog from "./NewTestDialog";
import Layout from "@/components/common/Layout";
import { useDashboard } from "../hooks/useDashboard";
import { LeaderboardTable } from "@/features/leaderboard/ui/LeaderboardTable";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
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
    avgScore,
    preparing,
    prepError,
    setPrepError,
    showPreparedDialog,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
  } = useDashboard();

  const wasPreparing = useRef(false);
  useEffect(() => {
    if (wasPreparing.current && !preparing && !showPreparedDialog && !prepError && !preparingDialogOpen) {
      toast({
        title: "Questions Ready!",
        description: "Your practice test is ready to start.",
      });
    }
    wasPreparing.current = preparing;
  }, [preparing, showPreparedDialog, prepError, preparingDialogOpen]);

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
        <div className="flex items-center gap-2 sm:gap-3">
          <NewTestDialog onStart={handlePrepareTest} subjects={user?.courses || []}>
            <Button size="sm" className="text-xs px-2.5 py-1 w-full sm:w-auto">
              Start New Test
              <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </NewTestDialog>
          {!user?.hasJoinedLeaderboard && (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs px-2.5 py-1 w-full sm:w-auto"
            >
              Join Leaderboard
            </Button>
          )}
        </div>
      }
    >
      {userLoading ? (
        <div className="flex justify-center items-center h-full min-h-[400px] text-sm">
          Loading...
        </div>
      ) : userError ? (
        <div className="flex justify-center items-center h-full min-h-[400px] text-sm text-red-500">
          {userError}
        </div>
      ) : (
        <>
          {showPreparingDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 px-4">
              <div className="bg-background p-4 sm:p-6 rounded-lg shadow-lg text-center max-w-[90%] sm:max-w-md w-full">
                <div className="text-base sm:text-lg font-semibold mb-2">Preparing Questions...</div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-4">Please wait while we prepare your test.</div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setPreparingDialogOpen(false)}>
                  Continue in background
                </Button>
              </div>
            </div>
          )}
          {prepError && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 px-4">
              <div className="bg-background p-4 sm:p-6 rounded-lg shadow-lg text-center max-w-[90%] sm:max-w-md w-full">
                <div className="text-base sm:text-lg font-semibold mb-2 text-red-600">{prepError}</div>
                <Button size="sm" className="w-full sm:w-auto" onClick={() => setPrepError("")}>
                  Close
                </Button>
              </div>
            </div>
          )}
          {showPreparedDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 px-4">
              <div className="bg-background p-4 sm:p-6 rounded-lg shadow-lg text-center max-w-[90%] sm:max-w-md w-full">
                <div className="text-base sm:text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
                <div className="flex flex-col gap-2 mt-4">
                  <Button size="sm" className="w-full" onClick={handleGoToTest}>
                    Go To Test
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setShowPreparedDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          <section className="mb-6 sm:mb-8 px-4 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {user?.firstName ?? "User"}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold">Track your progress</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-primary/10 p-2 mb-2">
                      {stat.icon}
                    </div>
                    <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-4 sm:px-6">
            <TabsList className="mb-4 grid grid-cols-2 sm:flex sm:flex-wrap justify-start">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
              {/* <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">Leaderboard</TabsTrigger> */}
              {/* <TabsTrigger value="recommendations" className="text-xs sm:text-sm">Recommendations</TabsTrigger> */}
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Subject Progress</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your performance across all subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectsPerformanceLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-3 sm:h-4 w-1/4" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))
                    ) : subjectsPerformanceError ? (
                      <p className="text-xs sm:text-sm text-red-500">{subjectsPerformanceError}</p>
                    ) : subjectsPerformance && subjectsPerformance.length > 0 ? (
                      subjectsPerformance.map((subject, index) => {
                        const roundedPercent = Math.round(subject.percentage);
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span>{subject.subjectName.charAt(0).toUpperCase() + subject.subjectName.slice(1)}</span>
                              <span className="font-medium">{roundedPercent}%</span>
                            </div>
                            <Progress value={roundedPercent} className="h-1.5 sm:h-2" />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">No subjects found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="my-4 sm:my-6" />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Tests</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your most recent practice tests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTestsLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[200px]" />
                              <Skeleton className="h-3 sm:h-4 w-[100px] sm:w-[150px]" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
                        </div>
                      ))
                    ) : recentTestsError ? (
                      <p className="text-xs sm:text-sm text-red-500">{recentTestsError}</p>
                    ) : recentTests.length > 0 ? (
                      recentTests.slice(0, 5).map((test) => (
                        <div key={test.testId} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg flex-wrap gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                              <BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">
                                <span className="flex flex-wrap gap-1">
                                  {test.subjects.map((subject, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{subject.name}</Badge>
                                  ))}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {new Date(test.dateTaken).toLocaleDateString()} • {test.subjects.length * 40} questions • Standard
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Badge
                              variant={(() => {
                                const totalScore = test.subjects.reduce((acc, s) => acc + s.score, 0);
                                return totalScore >= 250 ? "default" : "outline";
                              })()}
                              className="text-xs"
                            >
                              {(() => {
                                const totalScore = test.subjects.reduce((acc, s) => acc + s.score, 0);
                                return `${Math.round(totalScore)}`;
                              })()}
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-xs px-2">Review</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">No recent tests found.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">View All Tests</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceOverview recentTests={recentTests} />
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