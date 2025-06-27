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
import { SignInForm } from "./features/auth/ui/SignInForm";
import DashboardPage from "@/features/dashboard/ui/DashboardPage";
import SubmissionSuccess from "@/features/practice/ui/SubmissionSuccess";
import LeaderboardPage from "@/features/leaderboard/ui/LeaderboardPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<TestHistoryTable />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/test-history" element={<TestHistoryTable />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/practice/test" element={<TestInterface />} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
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
