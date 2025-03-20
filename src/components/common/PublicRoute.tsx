import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/routes.constant";
import LoadingState from "@/components/states/LoadingState";

/**
 * PublicRoute component prevents authenticated users from accessing auth pages
 * If user is authenticated, they will be redirected to the dashboard
 */
const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState fullScreen text="Checking authentication..." />;
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // If not authenticated, render the auth pages
  return <Outlet />;
};

export default PublicRoute;