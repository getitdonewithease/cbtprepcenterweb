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

const Home = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock user data
  const user = {
    name: "Oluwaseun Adeyemi",
    email: "oluwaseun@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=oluwaseun",
    isPremium: false,
    subjects: ["Mathematics", "English", "Physics", "Chemistry"],
    recentScore: 68,
    totalTestsTaken: 12,
    rank: 45,
    totalUsers: 1250,
    percentile: 96.4,
    hasJoinedLeaderboard: false,
  };

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
      active: true,
    },
    {
      name: "Subjects",
      icon: <BookText className="h-5 w-5" />,
      path: "/subjects",
      active: false,
    },
    {
      name: "Test History",
      icon: <History className="h-5 w-5" />,
      path: "/history",
      active: false,
    },
    {
      name: "Leaderboard",
      icon: <Award className="h-5 w-5" />,
      path: "/leaderboard",
      active: false,
    },
    {
      name: "Resources",
      icon: <FileText className="h-5 w-5" />,
      path: "/resources",
      active: false,
    },
    {
      name: "Chats",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/chats",
      active: false,
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">UTME Prep</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${item.active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <Avatar className="mx-auto">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="container flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

            <div className="flex items-center gap-4">
              {!user.isPremium && (
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <span className="mr-2">🌟</span> Go Premium
                </Button>
              )}
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-6">
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
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="recommendations">Study Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
        </main>

        {/* Footer */}
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col md:h-16 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2023 UTME Prep. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex gap-4">
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
