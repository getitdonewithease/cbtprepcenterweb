import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Redirect to signin, preserving the location they were trying to go
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 