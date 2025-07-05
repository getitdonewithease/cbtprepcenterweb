import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import routes from "tempo-routes";
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
import SubmissionSuccess from "@/features/practice/ui/SubmissionSuccess";
import LeaderboardPage from "@/features/leaderboard/ui/LeaderboardPage";
import { Toaster } from "@/components/ui/toaster";
import { RequireAuth } from "./features/auth/hooks/RequireAuth";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/history" element={<RequireAuth><TestHistoryTable /></RequireAuth>} />
        <Route path="/subjects" element={<RequireAuth><Subjects /></RequireAuth>} />
        <Route path="/resources" element={<RequireAuth><Resources /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/test-history" element={<RequireAuth><TestHistoryTable /></RequireAuth>} />
        <Route path="/leaderboard" element={<RequireAuth><LeaderboardPage /></RequireAuth>} />
        <Route path="/practice/test" element={<RequireAuth><TestInterface /></RequireAuth>} />
        <Route path="/practice/review/:sessionId" element={<RequireAuth><TestReviewPage /></RequireAuth>} />
        <Route path="/submission-success" element={<RequireAuth><SubmissionSuccess /></RequireAuth>} />
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
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      <Toaster />
    </Suspense>
  );
}

export default App;
