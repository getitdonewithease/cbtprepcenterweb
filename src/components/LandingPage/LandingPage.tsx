import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BarChart3,
  Trophy,
  Brain,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

const LandingPage = () => {
  const navFooterLogoSize = 30; // tweak this number for fine-grained sizing (e.g., 66, 68)
  const heroLogoSize = 60;
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/brain.svg"
              alt="Fasiti logo"
              className="shrink-0"
              style={{ height: navFooterLogoSize, width: navFooterLogoSize }}
            />
            <h1 className="text-xl font-bold">UTME Prep</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="#features"
              className="text-sm font-medium hover:text-primary"
            >
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              to="#reviews"
              className="text-sm font-medium hover:text-primary"
            >
              Reviews
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="container flex flex-col items-center text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/brain.svg"
              alt="Fasiti logo"
              className="shrink-0"
              style={{ height: heroLogoSize, width: heroLogoSize }}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Ace Your UTME Exams with Confidence
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-10">
            The most comprehensive CBT preparation platform designed
            specifically for Nigerian UTME candidates. Practice, track, and
            improve your performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                Start Practicing Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="outline">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">10,000+</h3>
              <p className="text-muted-foreground">Practice Questions</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Detailed</h3>
              <p className="text-muted-foreground">Performance Analytics</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">National</h3>
              <p className="text-muted-foreground">Leaderboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to prepare effectively for your UTME exams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Practice Test Interface
              </h3>
              <p className="text-muted-foreground mb-4">
                Clean, JAMB-like CBT interface with subject selection, timer,
                and question navigation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Realistic exam environment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Timed practice sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Multiple subject combinations</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Visual analytics showing speed, accuracy, and subject-specific
                performance metrics.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Track your progress over time</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Identify weak areas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Subject-specific analytics</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Leaderboard System</h3>
              <p className="text-muted-foreground mb-4">
                Competitive ranking based on cumulative scores, accuracy, and
                completion time.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Compare with peers nationwide</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Filter by subject or time period
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Earn badges and recognition</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                AI Question Explanation
              </h3>
              <p className="text-muted-foreground mb-4">
                Premium subscription feature that provides detailed explanations
                for missed questions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Step-by-step solutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Concept explanations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Similar question recommendations
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Study Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Personalized topic suggestions and learning resource
                recommendations based on performance gaps.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Targeted study plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Curated learning resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Progress tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Comprehensive Resources
              </h3>
              <p className="text-muted-foreground mb-4">
                Access to a wide range of study materials and resources to
                supplement your preparation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Subject-specific materials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Past questions and solutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Exam tips and strategies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with UTME Prep in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4 relative">
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create an Account</h3>
              <p className="text-muted-foreground">
                Sign up for free and set up your profile with your preferred
                subjects and goals.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4 relative">
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Take Practice Tests</h3>
              <p className="text-muted-foreground">
                Choose your subjects and start taking realistic UTME practice
                tests with our CBT interface.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4 relative">
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-muted-foreground">
                Review your performance analytics and follow personalized study
                recommendations to improve.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Link to="/signup">
              <Button size="lg">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who have improved their UTME scores with our
              platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                "UTME Prep helped me improve my score from 220 to 298! The
                practice tests are very similar to the actual UTME, and the
                performance analytics helped me identify my weak areas."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">CO</span>
                </div>
                <div>
                  <p className="font-medium">Chioma Okonkwo</p>
                  <p className="text-sm text-muted-foreground">
                    Medicine, UNILAG
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                "The AI explanations for questions I got wrong were incredibly
                helpful. It's like having a personal tutor available 24/7. I'm
                now confident about scoring high in my UTME."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">EE</span>
                </div>
                <div>
                  <p className="font-medium">Emeka Eze</p>
                  <p className="text-sm text-muted-foreground">
                    Engineering, UNIBEN
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(4)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <Star className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-muted-foreground mb-6">
                "The leaderboard feature motivated me to study harder. Seeing my
                rank improve each week kept me going. The study recommendations
                were spot on for my needs."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">TB</span>
                </div>
                <div>
                  <p className="font-medium">Tunde Bakare</p>
                  <p className="text-sm text-muted-foreground">
                    Economics, OAU
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ace Your UTME?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of students already preparing effectively with UTME
            Prep
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/brain.svg"
                  alt="Fasiti logo"
                  className="shrink-0"
                  style={{ height: navFooterLogoSize, width: navFooterLogoSize }}
                />
                <h2 className="text-xl font-bold">UTME Prep</h2>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                The most comprehensive CBT preparation platform designed
                specifically for Nigerian UTME candidates.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
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
                  className="text-muted-foreground hover:text-primary"
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
                  className="text-muted-foreground hover:text-primary"
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
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="#features"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#reviews"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signin"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-6 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} UTME Prep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
