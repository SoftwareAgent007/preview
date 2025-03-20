import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/common/layout/AuthLayout";
import HumanVerification from "@/components/auth/HumanVerification";
import { ROUTES } from "@/routes/routes.constant";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(true); // Set to true to show the message
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isHumanVerified) {
      setError("Please verify that you are human before signing in.");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout backgroundImage="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1974&auto=format&fit=crop">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">Sign in to your account</h1>
        
        {sessionExpired && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <div className="text-emerald-500 mt-0.5">
              <AlertCircle size={18} />
            </div>
            <p className="text-sm text-emerald-700">
              Your session has expired, please login to continue.
            </p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <div className="text-red-500 mt-0.5">
              <AlertCircle size={18} />
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link 
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            New user?{" "}
            <Link 
              to={ROUTES.REGISTER} 
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Create an account
            </Link>
          </p>
        </div>
        
        <HumanVerification onVerificationChange={setIsHumanVerified} />
      </motion.div>
    </AuthLayout>
  );
};

export default Login;