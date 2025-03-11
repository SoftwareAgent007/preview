import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Menu Toggle Button - Always Visible */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-30"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar with Animation */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            {/* Overlay - Only on Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed lg:relative z-40"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <motion.main 
          className="flex-1 overflow-y-auto bg-gray-50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;