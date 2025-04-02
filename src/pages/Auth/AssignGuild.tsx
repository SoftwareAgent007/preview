import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/common/layout/AuthLayout";
import { ROUTES } from "@/routes/routes.constant";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardContext } from "@/common/context/queryContext";

const AssignGuild = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, assignGuild, checkLogin } = useAuth();
  const { setGuildId } = useDashboardContext();
  const [guildId, setGuildIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Check if user has guilds
  const hasGuilds = user?.guildIds && user.guildIds.length > 0;

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      // First try to login with the provided password
      await checkLogin(user.email, password);

      // Then assign the guild
      try {
        await assignGuild(user.id, guildId, password);
        setAssignSuccess(true);
        // Set the newly assigned guild as active
        setGuildId(guildId);
      } catch (assignErr) {
        setError("Failed to assign guild. Please try again.");
        setAssignSuccess(false);
      }
    } catch (loginErr) {
      setError("Login failed. Please check your password and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardClick = () => {
    // Only navigate to dashboard if user has guilds
    if (hasGuilds || assignSuccess) {
      navigate(ROUTES.DASHBOARD);
    } else {
      setError("You need to assign a guild before accessing the dashboard.");
    }
  };

  if (!user) {
    return null; // useEffect will handle redirect
  }

  return (
    <AuthLayout backgroundImage="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1974&auto=format&fit=crop">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">Assign Guild</h1>
        
        <div className={`border rounded-md p-4 mb-6 ${assignSuccess ? 'bg-emerald-50 border-emerald-200' : hasGuilds ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${assignSuccess ? 'text-emerald-500' : hasGuilds ? 'text-blue-500' : 'text-yellow-500'}`}>
              <AlertCircle size={18} />
            </div>
            <p className={`text-sm ${assignSuccess ? 'text-emerald-700' : hasGuilds ? 'text-blue-700' : 'text-yellow-700'}`}>
              {assignSuccess 
                ? "Guild successfully assigned! You can now proceed to the dashboard."
                : hasGuilds 
                  ? "You have guilds assigned to your account. You can add more or proceed to dashboard."
                  : "Your account doesn't have any guilds assigned. Please enter your Discord guild ID to continue."
              }
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-red-500 mt-0.5">
                <AlertCircle size={18} />
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="guildId" className="block text-sm font-medium">
                Discord Guild ID
              </label>
              <Input
                id="guildId"
                placeholder="Enter your Discord guild ID"
                value={guildId}
                onChange={(e) => setGuildIdInput(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                You can find your guild ID by enabling Developer Mode in Discord and right-clicking your server.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Required to refresh your session after guild assignment.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning Guild...
                </>
              ) : (
                "Assign Guild"
              )}
            </Button>

            {(hasGuilds || assignSuccess) && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDashboardClick}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </AuthLayout>
  );
};

export default AssignGuild;