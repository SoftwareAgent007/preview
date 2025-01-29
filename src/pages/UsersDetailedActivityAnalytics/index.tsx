import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import UsersDetailedNavigation from "./UsersDetailedNavigation";
import { Outlet, useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const UsersDetailedActivityAnalytics = () => {
  const location = useLocation();
  
  const getBreadcrumbPath = () => {
    if (location.pathname.includes('gaming')) {
      return ROUTES.USER_ACTIVITY_DETAILED_GAMING;
    } else if (location.pathname.includes('status')) {
      return ROUTES.USER_ACTIVITY_DETAILED_STATUS;  
    } else if (location.pathname.includes('presence')) {
      return ROUTES.USER_ACTIVITY_DETAILED_PRESENCE;
    }
    return ROUTES.USER_ACTIVITY_DETAILED;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[getBreadcrumbPath()]} />
        </div>

        <div className="flex items-center justify-between items-center mb-6 px-6">
          <UsersDetailedNavigation />
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4" />
            Export Full Report
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default UsersDetailedActivityAnalytics;
