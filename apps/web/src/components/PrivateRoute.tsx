import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";

type PrivateRouteProps = {
  children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/admin/login" />;
  }

  return children;
}
