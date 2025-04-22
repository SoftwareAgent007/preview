import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH = 128;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster />
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
              initial={{ 
                x: -SIDEBAR_WIDTH,
                width: 0,
              }}
              animate={{ 
                x: 0,
                width: SIDEBAR_WIDTH,
              }}
              exit={{ 
                x: -SIDEBAR_WIDTH,
                width: 0,
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
              className="fixed lg:relative z-40 h-full"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content with Smooth Width Transition */}
      <motion.div 
        layout
        animate={{
          marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        className="flex flex-col flex-1 overflow-hidden lg:ml-[var(--sidebar-margin)]"
        style={{
          '--sidebar-margin': isSidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px'
        } as React.CSSProperties}
      >
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <motion.main 
          className="flex-1 overflow-y-auto bg-gray-50 p-6"
          layout
        >
          {children}
          <Outlet/>
        </motion.main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;