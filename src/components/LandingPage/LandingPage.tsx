import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import brainLogo from "/FasitiLogo-bg.png";
import {
  BookOpen,
  BarChart3,
  Trophy,
  Brain,
  CheckCircle,
  ArrowRight,
  Star,
  Menu,
  X,
  TrendingUp,
  Zap,
  Target,
  Award,
  Moon,
  Sun,
} from "lucide-react";

const LandingPage = () => {
  const navFooterLogoHeightSize = 50;
  const navFooterLogoWidthSize = 45;
  const heroLogoHeightSize = 120;
  const heroLogoWidthSize = 110;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage or system preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme-mode");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Update theme on change
  React.useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme-mode", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme-mode", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Add global animation styles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse-glow {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
        }
        50% { 
          box-shadow: 0 0 40px rgba(33, 150, 243, 0.5);
        }
      }
      .float-animation {
        animation: float 3s ease-in-out infinite;
      }
      .slide-up-animation {
        animation: slide-up 0.6s ease-out forwards;
      }
      .fade-in-animation {
        animation: fadeIn 0.8s ease-out forwards;
      }
      .pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-colors duration-300">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={brainLogo}
              alt="Fasiti logo"
              className="shrink-0"
              style={{
                height: navFooterLogoHeightSize,
                width: navFooterLogoWidthSize,
              }}
            />
            <h1 className="text-2xl font-black tracking-widest bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 drop-shadow-sm">
              FASITI
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#reviews"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Reviews
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <Link to="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur p-4 space-y-3 transition-colors duration-300">
            <a
              href="#features"
              className="block text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block text-sm font-medium hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#reviews"
              className="block text-sm font-medium hover:text-primary transition-colors"
            >
              Reviews
            </a>
            <div className="flex gap-2 pt-2">
              <Link to="/signin" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold"
                  size="sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold"
                  size="sm"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-20 transition-colors duration-300">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-950 dark:via-background dark:to-slate-900 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-pulse transition-opacity duration-300" />
          <div
            className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-pulse transition-opacity duration-300"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-3 transition-opacity duration-300" />
        </div>

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Copy */}
            <div
              className="flex flex-col justify-center fade-in-animation"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-200 dark:border-blue-800">
                  <Zap className="h-4 w-4" />
                  The Future of UTME Preparation
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Transform Your UTME Strategy
                </span>
                <br />
                <span className="text-foreground">
                  Score Higher, Study Smarter
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Join 50,000+ Nigerian students succeeding on their UTME exams
                with Fasiti's AI-powered CBT platform. Practice like the real
                exam, master every concept.
              </p>

              {/* Key Benefits - Quick List */}
              <div className="space-y-4 mb-10">
                {[
                  {
                    icon: CheckCircle,
                    text: "10,000+ realistic practice questions",
                  },
                  {
                    icon: TrendingUp,
                    text: "AI-powered performance analytics",
                  },
                  { icon: Award, text: "Compete nationally & track progress" },
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 slide-up-animation"
                    style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <benefit.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-foreground">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="group gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                  >
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group shadow-md hover:shadow-lg transition-all border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="text-sm text-muted-foreground">
                <p className="mb-3 font-medium">Trusted by students from:</p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    UNILAG
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    UNIBEN
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    OAU
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    UI
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Dashboard Mock */}
            <div
              className="relative h-full min-h-96 flex items-center justify-center fade-in-animation"
              style={{ animationDelay: "0.4s" }}
            >
              {/* Floating Card - Glassmorphism Style */}
              <div className="float-animation w-full max-w-md">
                {/* Backdrop Blur Card */}
                <div className="relative p-6 rounded-3xl bg-white/20 dark:bg-slate-900/20 backdrop-blur-2xl border border-white/30 dark:border-slate-700/30 shadow-2xl overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />

                  {/* Card Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">
                        Your Performance
                      </h3>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white text-xs font-bold">
                        ↑
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-2xl p-5 border border-blue-200/30 dark:border-blue-700/30">
                      <div className="text-sm text-muted-foreground mb-2">
                        Current Score
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                            287
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            out of 400
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-500">
                            +18
                          </div>
                          <div className="text-xs text-muted-foreground">
                            this week
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                      {[
                        {
                          subject: "English",
                          score: 78,
                          color: "from-blue-400 to-blue-600",
                        },
                        {
                          subject: "Math",
                          score: 85,
                          color: "from-purple-400 to-purple-600",
                        },
                        {
                          subject: "Physics",
                          score: 72,
                          color: "from-pink-400 to-pink-600",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{item.subject}</span>
                            <span className="text-muted-foreground">
                              {item.score}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Tests Taken", value: "24" },
                        { label: "Accuracy", value: "78%" },
                        { label: "Ranking", value: "#342" },
                      ].map((stat, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200/30 dark:border-slate-700/30"
                        >
                          <div className="text-sm font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                            {stat.value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA in Card */}
                    <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all hover:shadow-lg">
                      View Full Dashboard →
                    </button>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" />
                <div
                  className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Grid Layout */}
      <section
        id="features"
        className="relative py-24 md:py-32 overflow-hidden transition-colors duration-300"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-background to-purple-50 dark:from-slate-950/50 dark:via-background dark:to-slate-900/50 transition-colors duration-300" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-3 transition-opacity duration-300" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-3 transition-opacity duration-300" />

        <div className="container relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800">
              <Target className="h-4 w-4" />
              Powerful Features
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools designed specifically for UTME success. From
              realistic practice tests to AI-powered insights, we've got you
              covered.
            </p>
          </div>

          {/* Featured Feature - Full Width */}
          <div className="mb-16 group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-gradient-to-br from-blue-50/80 via-background/80 to-purple-50/80 dark:from-slate-800/40 dark:via-background/40 dark:to-slate-900/40 rounded-3xl p-8 md:p-12 border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm hover:border-blue-300/70 dark:hover:border-blue-700/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-blue-900/30 dark:hover:shadow-xl">
              {/* Image Side */}
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="relative w-full max-w-sm h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-2xl border border-blue-200/30 dark:border-blue-800/40 overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 className="h-24 w-24 text-blue-400/40 dark:text-blue-500/40 transition-colors duration-300" />
                  </div>
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-green-400 rounded-full opacity-10 blur-2xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400 rounded-full opacity-10 blur-2xl" />
                </div>
              </div>

              {/* Content Side */}
              <div className="order-1 lg:order-2 space-y-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3 text-foreground transition-colors duration-300">
                    AI Performance Analytics
                  </h3>
                  <p className="text-lg text-muted-foreground dark:text-slate-300 leading-relaxed transition-colors duration-300">
                    Get intelligent insights into your strengths and weaknesses
                    with our advanced analytics engine. Track progress in
                    real-time across all subjects and identify areas that need
                    improvement.
                  </p>
                </div>

                <ul className="space-y-3">
                  {[
                    "Real-time performance tracking across all subjects",
                    "Predictive analytics to forecast exam readiness",
                    "Comparative analytics against national averages",
                    "Personalized weak area identification",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mt-1">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-foreground dark:text-slate-200 font-medium group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup">
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800">
                    Explore Analytics <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Practice Test Interface",
                description:
                  "Clean, JAMB-like CBT interface with subject selection, timer, and question navigation.",
                features: [
                  "Realistic exam environment",
                  "Timed practice sessions",
                  "Multiple subject combinations",
                ],
                gradient: "from-blue-400 to-blue-600",
              },
              {
                icon: Trophy,
                title: "Leaderboard System",
                description:
                  "Competitive ranking based on cumulative scores, accuracy, and completion time.",
                features: [
                  "Compare with peers nationwide",
                  "Filter by subject or time period",
                  "Earn badges and recognition",
                ],
                gradient: "from-purple-400 to-purple-600",
              },
              {
                icon: Brain,
                title: "AI Question Explanations",
                description:
                  "Premium feature providing detailed explanations and concept breakdowns for missed questions.",
                features: [
                  "Step-by-step solutions",
                  "Concept explanations",
                  "Similar question recommendations",
                ],
                gradient: "from-pink-400 to-pink-600",
              },
              {
                icon: Target,
                title: "Smart Study Recommendations",
                description:
                  "Personalized study paths based on your performance gaps and learning style.",
                features: [
                  "AI-powered study plans",
                  "Adaptive difficulty levels",
                  "Curated learning resources",
                ],
                gradient: "from-emerald-400 to-emerald-600",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description:
                  "Comprehensive progress metrics showing improvement over time with detailed breakdowns.",
                features: [
                  "Weekly performance reports",
                  "Long-term trend analysis",
                  "Goal setting & tracking",
                ],
                gradient: "from-orange-400 to-orange-600",
              },
              {
                icon: Award,
                title: "Achievement System",
                description:
                  "Gamified learning with badges, milestones, and achievements to keep you motivated.",
                features: [
                  "Unlock special badges",
                  "Daily streak rewards",
                  "Expert certifications",
                ],
                gradient: "from-yellow-400 to-yellow-600",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-card dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-7 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-blue-900/20 hover:-translate-y-1 overflow-hidden backdrop-blur-sm"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    opacity: 0,
                    animation: `slide-up 0.6s ease-out forwards`,
                  }}
                >
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 bg-gradient-to-br ${feature.gradient} transition-opacity duration-300 pointer-events-none`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${feature.gradient} p-4 w-fit mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-foreground dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-muted-foreground dark:text-slate-300 mb-5 leading-relaxed transition-colors duration-300">
                      {feature.description}
                    </p>

                    <ul className="space-y-2">
                      {feature.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          <span className="text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-24 md:py-32 bg-gradient-to-b from-primary/5 via-background to-primary/5 dark:from-slate-900/50 dark:via-background dark:to-slate-900/50 transition-colors duration-300"
      >
        <div className="container">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-sm font-semibold mb-4 transition-colors duration-300">
              Getting Started
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto transition-colors duration-300">
              Get started with Fasiti in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                num: 1,
                icon: BookOpen,
                title: "Create an Account",
                description:
                  "Sign up for free and set up your profile with your preferred subjects and goals.",
              },
              {
                num: 2,
                icon: BookOpen,
                title: "Take Practice Tests",
                description:
                  "Choose your subjects and start taking realistic UTME practice tests with our CBT interface.",
              },
              {
                num: 3,
                icon: BarChart3,
                title: "Track Your Progress",
                description:
                  "Review your performance analytics and follow personalized study recommendations to improve.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-24 -right-6 w-12 h-1 bg-gradient-to-r from-primary to-primary/20 dark:from-blue-400 dark:to-blue-400/20 transition-colors duration-300" />
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative z-10 mb-6">
                      <div className="rounded-full bg-gradient-to-br from-primary to-primary/70 p-5 relative shadow-lg hover:shadow-xl transition-all duration-300">
                        <Icon className="h-8 w-8 text-primary-foreground" />
                        <span className="absolute -top-3 -right-3 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                          {item.num}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground dark:text-slate-300 leading-relaxed transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-16">
            <Link to="/signup">
              <Button
                size="lg"
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started Now <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section
        id="reviews"
        className="py-24 md:py-32 bg-gradient-to-b from-background via-primary/5 to-background dark:from-slate-900 dark:via-slate-950/50 dark:to-slate-900 transition-colors duration-300"
      >
        <div className="container">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-sm font-semibold mb-4 transition-colors duration-300">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto transition-colors duration-300">
              Hear from students who have improved their UTME scores with our
              platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: '"UTME Prep helped me improve my score from 220 to 298! The practice tests are very similar to the actual UTME, and the performance analytics helped me identify my weak areas."',
                name: "Chioma Okonkwo",
                course: "Medicine, UNILAG",
                initials: "CO",
              },
              {
                rating: 5,
                text: "\"The AI explanations for questions I got wrong were incredibly helpful. It's like having a personal tutor available 24/7. I'm now confident about scoring high in my UTME.\"",
                name: "Emeka Eze",
                course: "Engineering, UNIBEN",
                initials: "EE",
              },
              {
                rating: 4,
                text: '"The leaderboard feature motivated me to study harder. Seeing my rank improve each week kept me going. The study recommendations were spot on for my needs."',
                name: "Tunde Bakare",
                course: "Economics, OAU",
                initials: "TB",
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="group bg-card dark:bg-slate-800/50 border border-primary/10 dark:border-slate-700/50 rounded-2xl p-8 hover:border-primary/30 dark:hover:border-blue-500/50 hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex flex-col"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-colors duration-300 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground dark:text-slate-300 mb-8 flex-grow italic leading-relaxed transition-colors duration-300">
                  {review.text}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-primary/10 dark:border-slate-700/30">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 dark:from-blue-500/30 to-primary/10 dark:to-blue-600/20 flex items-center justify-center font-bold text-primary dark:text-blue-300 flex-shrink-0 transition-colors duration-300">
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white transition-colors duration-300">
                      {review.name}
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                      {review.course}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-r from-primary/95 to-primary dark:from-blue-900/80 dark:to-purple-900/80 text-primary-foreground relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute top--40 right--40 w-80 h-80 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-foreground rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Ace Your UTME?
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-95 leading-relaxed">
            Join thousands of students already preparing effectively with
            Fasiti. Start your journey to exam success today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Get Started for Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-white/20 hover:bg-white/30 shadow-lg hover:shadow-xl transition-all"
              >
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 md:py-20 transition-colors duration-300">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={brainLogo}
                  alt="Fasiti logo"
                  className="shrink-0"
                  style={{
                    height: navFooterLogoHeightSize,
                    width: navFooterLogoWidthSize,
                  }}
                />
                <div>
                  <h2 className="text-3xl font-black tracking-widest bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                    FASITI
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                    UTME Prep Center
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground dark:text-slate-300 mb-6 max-w-sm leading-relaxed transition-colors duration-300">
                The most comprehensive CBT preparation platform designed
                specifically for Nigerian UTME candidates.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors p-2 hover:bg-primary/10 dark:hover:bg-blue-500/10 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors p-2 hover:bg-primary/10 dark:hover:bg-blue-500/10 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors p-2 hover:bg-primary/10 dark:hover:bg-blue-500/10 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-sm uppercase tracking-wide text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#reviews"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Reviews
                  </a>
                </li>
                <li>
                  <Link
                    to="/signin"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-sm uppercase tracking-wide text-muted-foreground dark:text-slate-400 transition-colors duration-300">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 md:flex md:items-center md:justify-between text-center md:text-left text-sm text-muted-foreground dark:text-slate-400 transition-colors duration-300">
            <p>© {new Date().getFullYear()} Fasiti. All rights reserved.</p>
            <p className="mt-4 md:mt-0">
              Made with <span className="text-red-500">♥</span> for UTME
              candidates
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
