import { useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Search, SwitchCamera } from "lucide-react";
import { useLocation } from "react-router-dom";
import { DatePickerWithRange } from "../../ui/data-rande-picker";
import { BREADCRUMB_PATHS } from "@/routes/routes.constant";
import { DashboardContext } from "@/common/context/queryContext";

const Header = () => {
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dashboardContext = useContext(DashboardContext);

  const selectedPeriod = dashboardContext?.selectedPeriod;
  const guildId = dashboardContext?.guildId;
  const setSelectedPeriod = dashboardContext?.setSelectedPeriod;
  const setGuildId = dashboardContext?.setGuildId;

  const getCurrentTitle = (pathname: string) => {
    if (pathname.includes('gaming') || pathname.includes('presence') || pathname.includes('status')) {
      return 'Users Detailed Activity Analytics';
    }
    const breadcrumbs = BREADCRUMB_PATHS[pathname];
    return breadcrumbs ? breadcrumbs[breadcrumbs.length - 1].label : "DataPlay";
  };

  const currentTitle = getCurrentTitle(location.pathname);

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
            <h2
              className={`font-bold transition-all ${
                currentTitle.length > 29 ? "text-xl" : "text-2xl"
              }`}
            >
              {currentTitle}
            </h2>

            <div className="hidden xl:flex items-center space-x-4">
              <DatePickerWithRange 
                value={selectedPeriod}
                onChange={(period) => setSelectedPeriod && period && setSelectedPeriod(period)}
              />
              
              <Select value={guildId} onValueChange={(id) => setGuildId && setGuildId(id)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Guild" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="guild1">Guild 1</SelectItem>
                  <SelectItem value="guild2">Guild 2</SelectItem>
                </SelectContent>
              </Select>
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
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-fit bg-white">
                <div className="flex flex-col space-y-1">
                  <Button variant="ghost" className="justify-start w-[180px]">
                    <LogOut className="h-4 mr-2" />
                    Logout
                  </Button>
                  <Button variant="ghost" className="justify-start w-[180px]">
                    <SwitchCamera className="h-4 mr-2" />
                    Switch Account
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
              value={selectedPeriod}
              onChange={(period) => setSelectedPeriod && period && setSelectedPeriod(period)}
            />
            <Select value={guildId} onValueChange={(id) => setGuildId && setGuildId(id)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Guild" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guild1">Guild 1</SelectItem>
                <SelectItem value="guild2">Guild 2</SelectItem>
              </SelectContent>
            </Select>
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