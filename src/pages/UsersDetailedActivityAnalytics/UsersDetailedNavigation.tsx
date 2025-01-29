import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routes.constant";
import { useLocation, useNavigate } from "react-router-dom";

const UsersDetailedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    console.log(location.pathname, path, location.pathname.includes(path.toLowerCase()));
    return location.pathname.includes(path.toLowerCase());
  };

  const navigationItems = [
    { label: "Gaming", path: ROUTES.USER_ACTIVITY_DETAILED_GAMING },
    { label: "Presence", path: ROUTES.USER_ACTIVITY_DETAILED_PRESENCE },
    { label: "Status", path: ROUTES.USER_ACTIVITY_DETAILED_STATUS },
  ];

  return (
    <div className="flex gap-4">
      {navigationItems.map((item) => (
        <Button
          key={item.label}
          variant={isActive(item.label) ? "outline" : "default"}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default UsersDetailedNavigation;
