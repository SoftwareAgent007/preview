import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Search, SwitchCamera, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePickerWithRange } from "../../ui/data-rande-picker";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardContext } from "@/common/context/queryContext";
import { DEFAULT_DATE_RANGE } from "@/hooks/apiService";
import { useQueryClient } from "react-query";

const Header = ({ isSidebarOpen, setIsSidebarOpen }: { 
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { selectedPeriod, guildId, setSelectedPeriod, setGuildId } = useDashboardContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!guildId && user?.guildIds && user.guildIds.length > 0) {
      const defaultGuildId = "1306748279903621142";
      const guildToSet = user.guildIds.includes(defaultGuildId) ? defaultGuildId : user.guildIds[0];
      setGuildId(guildToSet);
    }
  }, [user, guildId, setGuildId]);

  const isMoreThenOneGuild = user?.guildIds?.length && user?.guildIds?.length > 1;

  const getCurrentTitle = (pathname: string) => {
    if (
      pathname.includes("gaming") ||
      pathname.includes("presence") ||
      pathname.includes("status")
    ) {
      return "Users Detailed Activity Analytics";
    }
    const breadcrumbs = BREADCRUMB_PATHS[pathname];
    return breadcrumbs ? breadcrumbs[breadcrumbs.length - 1].label : "DataPlay";
  };

  const currentTitle = getCurrentTitle(location.pathname);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate(ROUTES.LOGIN);
  };

  const handleDatePickerClose = () => {
    queryClient.invalidateQueries();
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <motion.header
      className="w-full border-b backdrop-blur bg-white"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto" style={{ maxWidth: "1500px" }}>
        <div className="flex h-16 items-center px-4 justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2
              className={`font-bold transition-all ${
                currentTitle.length > 29 ? "text-xl" : "text-2xl"
              }`}
            >
              {currentTitle}
            </h2>

            <div className="hidden xl:flex items-center space-x-4">
              <DatePickerWithRange 
                value={selectedPeriod || DEFAULT_DATE_RANGE}
                onClose={handleDatePickerClose}
                width="300"
                onChange={(period) => {
                  setSelectedPeriod && period && setSelectedPeriod(period);
                }}
                disabledDays={{ after: new Date() }}
              />
              
              {isMoreThenOneGuild && (
                <Select value={guildId} onValueChange={(id) => setGuildId && setGuildId(id)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select Guild" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {user?.guildIds?.map((id) => (
                    <SelectItem key={id} value={id}>
                      <div>
                        Guild {id}
                      </div>
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden xl:flex relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-[200px]" />
            </div>

            <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="" alt={user?.name || ''} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-fit bg-white">
                <div className="flex flex-col space-y-1">
                  <div className="px-2 py-1.5 text-sm font-medium">{user?.name}</div>
                  <div className="px-2 pb-1.5 text-xs text-gray-500">{user?.email}</div>
                  <Button
                    variant="ghost"
                    className="justify-start w-[180px]"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        <div className="xl:hidden p-4 space-y-4">
          <div className="flex space-x-4">
            <DatePickerWithRange 
              value={selectedPeriod || DEFAULT_DATE_RANGE}
              onClose={handleDatePickerClose}
              width="300"
              onChange={(period) => {
                setSelectedPeriod && period && setSelectedPeriod(period);
              }}
              disabledDays={{ after: new Date() }}
            />
            {isMoreThenOneGuild && (
              <Select value={guildId} onValueChange={(id) => setGuildId && setGuildId(id)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Guild" />
                </SelectTrigger>
                <SelectContent>
                  {user?.guildIds?.map((id) => (
                    <SelectItem key={id} value={id}>
                      <div>
                        Guild {id}
                      </div>
                    </SelectItem>
                  ))}
                  </SelectContent>
              </Select>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 w-full" />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
