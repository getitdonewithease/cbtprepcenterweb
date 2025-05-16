import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";

// Lazy load components for better performance
const TestHistory = lazy(() => import("./components/TestHistory"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/history" element={<TestHistory />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="*" element={<div style={{ padding: 40, textAlign: 'center' }}><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p></div>} />
        <Route path="/history" element={<TestHistory />} />
      </Routes>
    </Suspense>
  );
}

export default App;
