import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { getAccessToken } from "@/lib/authToken";

export function RequireAuth({ children }: { children: ReactNode }) {
  const token = getAccessToken();
  const location = useLocation();

  if (!token) {
    // Redirect to signin, preserving the location they were trying to go
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 