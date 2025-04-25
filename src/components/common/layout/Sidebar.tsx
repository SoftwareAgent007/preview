import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuCategories } from "./constant";
import { ROUTES } from "@/routes/routes.constant";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onClose: () => void;
}

// Define which routes are accessible to which roles
const routePermissions = {
  [ROUTES.ADMIN]: ['ADMIN'],
  [ROUTES.AUDIT_LOGS]: ['ADMIN'],
  [ROUTES.AGENCY_PARTNER_DASHBOARD]: ['ADMIN', 'AGENCY_PARTNER'],
  [ROUTES.CLIENT_DASHBOARD]: ['ADMIN', 'CLIENT']
};

const Sidebar = ({ onClose }: SidebarProps) => {
    const location = useLocation();
    const { user } = useAuth();
    const [expandedItems, setExpandedItems] = useState<string[]>(
      location.pathname.includes('/user-activity/detailed') ? ['/user-activity'] : []
    );
  
    // Filter menu items based on user role
    const filteredMenuCategories = useMemo(() => {
      const filtered: typeof menuCategories = {};
      
      Object.entries(menuCategories).forEach(([category, items]) => {
        const filteredItems = items.filter(item => {
          // Check if this route has role restrictions
          const allowedRoles = routePermissions[item.path as keyof typeof routePermissions];
          
          // If no restrictions, show to everyone
          if (!allowedRoles) return true;
          
          // Otherwise, check if user's role is allowed
          return user && allowedRoles.includes(user.role);
        }).map(item => {
          // Also filter nested items if they exist
          if (item.nested) {
            return {
              ...item,
              nested: item.nested.filter(nestedItem => {
                const nestedAllowedRoles = routePermissions[nestedItem.path as keyof typeof routePermissions];
                if (!nestedAllowedRoles) return true;
                return user && nestedAllowedRoles.includes(user.role);
              })
            };
          }
          return item;
        });
        
        // Only include category if it has items
        if (filteredItems.length > 0) {
          filtered[category] = filteredItems;
        }
      });
      
      return filtered;
    }, [user]);
  
    const toggleExpand = (path: string) => {
      setExpandedItems(prev => 
        prev.includes(path) 
          ? prev.filter(p => p !== path)
          : [...prev, path]
      );
    };
  
    const isExactPath = (path: string) => location.pathname === path;
    const isNestedActive = (path: string) => location.pathname.startsWith(path) && path !== '/';

  return (
    <motion.aside
      className="w-[280px] h-screen bg-white border-r shadow-sm overflow-y-auto relative"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">DataPlay</h2>
        <nav className="space-y-6">
          {Object.entries(filteredMenuCategories).map(([category, items]) => (
            <div key={category} className="space-y-1">
              <p className="text-sm font-medium text-gray-500 mb-2">
                {category}
              </p>
              {items.map((item) => (
                <div key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                        (isExactPath(item.path) || (item.nested && isNestedActive(item.path)))
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={(e) => {
                      if (item.nested) {
                        e.preventDefault();
                        toggleExpand(item.path);
                      }
                    }}
                  >
                    <span className="h-5 w-5 mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.beta && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Beta</span>
                    )}
                    {item.nested && (
                      expandedItems.includes(item.path) 
                        ? <ChevronDown className="ml-auto h-4 w-4" />
                        : <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </NavLink>
                  
                  {item.nested && (
                    <AnimatePresence>
                      {expandedItems.includes(item.path) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-6 space-y-1"
                        >
                          {item.nested.map((nestedItem) => (
                            <NavLink
                              key={nestedItem.path}
                              to={nestedItem.path}
                              className={({ isActive }) =>
                                `block px-4 py-2 text-sm rounded-md ${
                                  isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                              }
                            >
                              {nestedItem.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;