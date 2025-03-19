import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/routes.constant";

interface AuthLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
}

const AuthLayout = ({ 
  children, 
  backgroundImage = "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1974&auto=format&fit=crop" 
}: AuthLayoutProps) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left side - Form */}
      <motion.div 
        className="w-full md:w-2/5 lg:w-1/3 h-full flex flex-col p-8 md:p-12 justify-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold">Discord Analytics</span>
          </Link>
        </div>
        
        {children}
      </motion.div>
      
      {/* Right side - Image */}
      <motion.div 
        className="hidden md:block md:w-3/5 lg:w-2/3 h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

export default AuthLayout;