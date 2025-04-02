import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/routes.constant";

interface ProtectedRouteProps {
  allowNoGuild?: boolean;
}

const ProtectedRoute = ({ allowNoGuild = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You might want to show a loading spinner here
    return null;
  }

  if (!user && !localStorage.getItem('user')) {
    // Only redirect if user never existed
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If user has no guilds and this route requires a guild
  if (!allowNoGuild && (!user?.guildIds || user.guildIds.length === 0)) {
    return <Navigate to={ROUTES.ASSIGN_GUILD} state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;