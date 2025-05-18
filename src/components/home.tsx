import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  BookOpen,
  Trophy,
  Clock,
  Brain,
  BarChart3,
  BookMarked,
  LayoutDashboard,
  BookText,
  History,
  Award,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";

import PerformanceOverview from "./Dashboard/PerformanceOverview";
import LeaderboardTable from "./Leaderboard/LeaderboardTable";
import RecommendationPanel from "./Study/RecommendationPanel";
import NewTestDialog from "./NewTestDialog";
import user from "../userdata";
import Layout from "./common/Layout";

const Home = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock user data
  // const user = {
  //   name: "Oluwaseun Adeyemi",
  //   email: "oluwaseun@example.com",
  //   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=oluwaseun",
  //   isPremium: false,
  //   subjects: ["Mathematics", "English", "Physics", "Chemistry"],
  //   recentScore: 68,
  //   totalTestsTaken: 12,
  //   rank: 45,
  //   totalUsers: 1250,
  //   percentile: 96.4,
  //   hasJoinedLeaderboard: false,
  // };

  // Mock quick stats
  const quickStats = [
    {
      label: "Tests Taken",
      value: user.totalTestsTaken,
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Avg. Score",
      value: "68%",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Rank",
      value: `#${user.rank}`,
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      label: "Avg. Speed",
      value: "45s/q",
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  // Mock recent tests
  const recentTests = [
    {
      id: 1,
      subject: "Mathematics",
      score: 75,
      date: "2023-05-15",
      questions: 40,
      timeTaken: "35 mins",
    },
    {
      id: 2,
      subject: "English",
      score: 82,
      date: "2023-05-13",
      questions: 40,
      timeTaken: "38 mins",
    },
    {
      id: 3,
      subject: "Physics",
      score: 65,
      date: "2023-05-10",
      questions: 40,
      timeTaken: "40 mins",
    },
  ];

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/",
      active: window.location.pathname === "/",
    },
    {
      name: "Subjects",
      icon: <BookText className="h-5 w-5" />,
      path: "/subjects",
      active: window.location.pathname === "/subjects",
    },
    {
      name: "Test History",
      icon: <History className="h-5 w-5" />,
      path: "/history",
      active: window.location.pathname === "/history",
    },
    {
      name: "Leaderboard",
      icon: <Award className="h-5 w-5" />,
      path: "/leaderboard",
      active: window.location.pathname === "/leaderboard",
    },
    {
      name: "Resources",
      icon: <FileText className="h-5 w-5" />,
      path: "/resources",
      active: window.location.pathname === "/resources",
    },
    {
      name: "Chats",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/chats",
      active: window.location.pathname === "/chats",
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      active: window.location.pathname === "/settings",
    },
  ];

  return (
    <Layout
      title="Dashboard"
      headerActions={
        <>
          <NewTestDialog onStart={(opts) => console.log("Start test with:", opts)}>
            <Button>
              Start New Practice Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </NewTestDialog>
          {!user.hasJoinedLeaderboard && (
            <Button variant="secondary">
              Join Leaderboard
            </Button>
          )}
        </>
      }
    >
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Welcome back, {user.name.split(" ")[0]}
          </p>
          <h2 className="text-3xl font-bold">Track your progress</h2>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {/* Subject Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>
                Your performance across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.subjects.map((subject, index) => {
                  // Mock different progress values for each subject
                  const progressValues = [78, 65, 82, 59];
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{subject}</span>
                        <span className="font-medium">
                          {progressValues[index]}%
                        </span>
                      </div>
                      <Progress
                        value={progressValues[index]}
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
              <CardDescription>
                Your most recent practice tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <BookMarked className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{test.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.date} • {test.questions} questions •{" "}
                          {test.timeTaken}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={test.score >= 70 ? "default" : "outline"}
                      >
                        {test.score}%
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Tests
              </Button>
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
    </Layout>
  );
};

export default Home;
