import { Suspense } from "react";
import { Routes, Route, useLocation, type Location } from "react-router-dom";
import Subjects from "./components/Subjects";
import Resources from "./components/Resources";
import { LeaderboardTable } from "@/features/leaderboard/ui/LeaderboardTable";
import { TestHistoryPage } from "@/features/test-history";
import { SettingsDialog } from "@/features/settings";
import LandingPage from "./components/LandingPage/LandingPage";
import TestInterface from "./features/practice/ui/TestInterface";
import TestReviewPage from "./features/practice/ui/TestReviewPage";
import { SignInForm } from "./features/auth/ui/SignInForm";
import DashboardPage from "@/features/dashboard/ui/DashboardPage";
import { ConfirmEmailPage } from "@/features/confirm-email";
import SubmissionSuccess from "@/features/practice/ui/SubmissionSuccess";
import LeaderboardPage from "@/features/leaderboard/ui/LeaderboardPage";
import { Toaster } from "@/components/ui/toaster";
import { RequireAuth } from "./features/auth/hooks/RequireAuth";
import { SavedQuestionsPage } from "@/features/saved-questions";
import TestSummaryPage from "./features/practice/ui/TestSummaryPage";
import { StartTestProvider, UserProvider } from "@/features/dashboard";
import { SubscriptionPlanPage } from "@/features/subscription";
import CompleteProfilePage from "@/features/complete-profile";
import { DailyChallengeTestPage, DailyChallengeReviewPage } from "@/features/daily-challenge";

function App() {
  const location = useLocation();
  // Settings is a dialog: opened from a page, that page stays rendered behind it
  const backgroundLocation = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <StartTestProvider>
      <Routes location={backgroundLocation ?? location}>
        {/* Public routes - no UserProvider needed */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignInForm defaultMode="signup" />} />
        <Route path="/forgot-password" element={<SignInForm defaultMode="forgot" />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        
        {/* Protected routes - wrapped with UserProvider */}
        <Route path="/complete-profile" element={<RequireAuth><UserProvider><CompleteProfilePage /></UserProvider></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><UserProvider><DashboardPage /></UserProvider></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><UserProvider><TestHistoryPage /></UserProvider></RequireAuth>} />
        <Route path="/subjects" element={<RequireAuth><UserProvider><Subjects /></UserProvider></RequireAuth>} />
        <Route path="/resources" element={<RequireAuth><UserProvider><Resources /></UserProvider></RequireAuth>} />
        {/* Opened directly (typed, refreshed, shared): the dialog over the dashboard */}
        <Route path="/settings/:section?" element={<RequireAuth><UserProvider><DashboardPage /><SettingsDialog /></UserProvider></RequireAuth>} />
        <Route path="/upgrage" element={<RequireAuth><UserProvider><SubscriptionPlanPage /></UserProvider></RequireAuth>} />
        <Route path="/test-history" element={<RequireAuth><UserProvider><TestHistoryPage /></UserProvider></RequireAuth>} />
        {/* <Route path="/leaderboard" element={<RequireAuth><UserProvider><LeaderboardPage /></UserProvider></RequireAuth>} /> */}
        <Route path="/practice/summary/:cbtSessionId" element={<RequireAuth><UserProvider><TestSummaryPage /></UserProvider></RequireAuth>} />
        <Route path="/practice/test/:cbtSessionId" element={<RequireAuth><UserProvider><TestInterface /></UserProvider></RequireAuth>} />
        <Route path="/practice/review/:sessionId" element={<RequireAuth><UserProvider><TestReviewPage /></UserProvider></RequireAuth>} />
        <Route path="/submission-success/:cbtSessionId" element={<RequireAuth><UserProvider><SubmissionSuccess /></UserProvider></RequireAuth>} />
        <Route path="/saved-questions" element={<RequireAuth><UserProvider><SavedQuestionsPage /></UserProvider></RequireAuth>} />
        <Route path="/daily-challenge/review/:date" element={<RequireAuth><UserProvider><DailyChallengeReviewPage /></UserProvider></RequireAuth>} />
        <Route path="/daily-challenge/:date" element={<RequireAuth><UserProvider><DailyChallengeTestPage /></UserProvider></RequireAuth>} />
        
        <Route
          path="*"
          element={
            <div style={{ padding: 40, textAlign: "center" }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/settings/:section?" element={<RequireAuth><SettingsDialog /></RequireAuth>} />
        </Routes>
      )}
      </StartTestProvider>
      <Toaster />
    </Suspense>
  );
}

export default App;
