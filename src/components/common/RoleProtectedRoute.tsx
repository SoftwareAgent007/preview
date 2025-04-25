import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/routes/routes.constant";
import { useAuth } from "@/contexts/AuthContext";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  redirectPath?: string;
}

const RoleProtectedRoute = ({ 
  allowedRoles, 
  redirectPath = ROUTES.DASHBOARD 
}: RoleProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  
  console.log(user, allowedRoles, user?.role);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
};

export default RoleProtectedRoute; 