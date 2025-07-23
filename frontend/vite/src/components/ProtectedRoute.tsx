import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import type { JSX } from "react";

interface ProtectedRouteProps {
  allowedModes: string[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedModes,
  children,
}) => {
  const { mode, loading } = useAuth();
  // If still loading, show nothing or a spinner
  if (loading) return <div>Loading...</div>;

  // If user mode is not allowed, redirect to "/"
  if (!allowedModes.includes(mode)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
