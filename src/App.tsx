import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Subjects from "./components/Subjects";
import Leaderboard from "./components/Leaderboard";
import Resources from "./components/Resources";
import Settings from "./components/Settings";
import SignIn from "./components/Auth/SignIn";
import LandingPage from "./components/LandingPage";
import TestInterface from "./components/Practice/TestInterface";

// Lazy load components for better performance
const TestHistory = lazy(() => import("./components/TestHistory"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/history" element={<TestHistory />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/practice/test" element={<TestInterface />} />
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
    </Suspense>
  );
}

export default App;
