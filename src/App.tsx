import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Subjects from "./components/Subjects";
import Resources from "./components/Resources";
import { LeaderboardTable } from "@/features/leaderboard/ui/LeaderboardTable";
import { TestHistoryTable } from "@/features/test-history/ui/TestHistoryTable";
import SettingsPage from "@/features/settings/ui/SettingsPage";
import LandingPage from "./components/LandingPage/LandingPage";
import TestInterface from "./features/practice/ui/TestInterface";
import TestReviewPage from "./features/practice/ui/TestReviewPage";
import { SignInForm } from "./features/auth/ui/SignInForm";
import { SignUpForm } from "./features/auth/ui/SignUpForm";
import DashboardPage from "@/features/dashboard/ui/DashboardPage";
import { ConfirmEmailPage } from "@/features/confirm-email";
import SubmissionSuccess from "@/features/practice/ui/SubmissionSuccess";
import LeaderboardPage from "@/features/leaderboard/ui/LeaderboardPage";
import { Toaster } from "@/components/ui/toaster";
import { RequireAuth } from "./features/auth/hooks/RequireAuth";
import { SavedQuestionsPage } from "@/features/saved-questions";
import TestSummaryPage from "./features/practice/ui/TestSummaryPage";
import { UserProvider } from "@/features/dashboard";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Public routes - no UserProvider needed */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        
        {/* Protected routes - wrapped with UserProvider */}
        <Route path="/dashboard" element={<RequireAuth><UserProvider><DashboardPage /></UserProvider></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><UserProvider><TestHistoryTable /></UserProvider></RequireAuth>} />
        <Route path="/subjects" element={<RequireAuth><UserProvider><Subjects /></UserProvider></RequireAuth>} />
        <Route path="/resources" element={<RequireAuth><UserProvider><Resources /></UserProvider></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><UserProvider><SettingsPage /></UserProvider></RequireAuth>} />
        <Route path="/test-history" element={<RequireAuth><UserProvider><TestHistoryTable /></UserProvider></RequireAuth>} />
        {/* <Route path="/leaderboard" element={<RequireAuth><UserProvider><LeaderboardPage /></UserProvider></RequireAuth>} /> */}
        <Route path="/practice/summary/:cbtSessionId" element={<RequireAuth><UserProvider><TestSummaryPage /></UserProvider></RequireAuth>} />
        <Route path="/practice/test/:cbtSessionId" element={<RequireAuth><UserProvider><TestInterface /></UserProvider></RequireAuth>} />
        <Route path="/practice/review/:sessionId" element={<RequireAuth><UserProvider><TestReviewPage /></UserProvider></RequireAuth>} />
        <Route path="/submission-success/:cbtSessionId" element={<RequireAuth><UserProvider><SubmissionSuccess /></UserProvider></RequireAuth>} />
        <Route path="/saved-questions" element={<RequireAuth><UserProvider><SavedQuestionsPage /></UserProvider></RequireAuth>} />
        
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
      <Toaster />
    </Suspense>
  );
}

export default App;
