import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { Bell, Home, KeyRound, LogOut, Music2, Search, SwitchCamera, Users } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePickerWithRange } from "../ui/data-rande-picker";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const getCurrentTitle = (pathname: string) => {
    if (pathname.includes('gaming') || pathname.includes('presence') || pathname.includes('status')) {
      return 'Users Detailed Activity Analytics';
    }
    const breadcrumbs = BREADCRUMB_PATHS[pathname];
    return breadcrumbs ? breadcrumbs[breadcrumbs.length - 1].label : "DataPlay";
  };

  const currentTitle = getCurrentTitle(location.pathname);

  return (
    <header className="w-full border-b backdrop-blur">
      <div className="mx-auto" style={{ maxWidth: "1500px" }}>
        <div className="flex h-16 items-center px-4 justify-between">
          
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <h2 className="text-2xl font-bold">{currentTitle}</h2>
            
            <div className="hidden xl:flex items-center space-x-4">
              <DatePickerWithRange />
              
              <Select>
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

            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.DASHBOARD)}>
                <Home className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.KEYWORD_ANALYTICS)}>
                <KeyRound className="h-5 w-5" />
              </Button>

              <Popover open={isUsersMenuOpen} onOpenChange={setIsUsersMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Users className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-32 bg-white">
                  <div className="flex flex-col items-left space-y-1 pl-2">
                    <Button className="pl-0 text-left pr-14 font-bold bg-blue-500 text-white" variant="ghost" onClick={() => navigate(ROUTES.USER_ACTIVITY)}>Main</Button>
                    <div className="pl-0 border-l border-gray-300">
                      <Button className="pr-10 pl-5 bg-white text-black" variant="ghost" onClick={() => navigate(ROUTES.USER_ACTIVITY_DETAILED_GAMING)}>Gaming</Button>
                      <Button className="pr-10 pl-5 bg-white text-black" variant="ghost" onClick={() => navigate(ROUTES.USER_ACTIVITY_DETAILED_STATUS)}>Status</Button>
                      <Button className="pr-10 pl-5 bg-white text-black" variant="ghost" onClick={() => navigate(ROUTES.USER_ACTIVITY_DETAILED_PRESENCE)}>Presence</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.MUSIC_METRICS)}>
                <Music2 className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <PopoverTrigger asChild>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-fit bg-white">
                  <div className="flex flex-col space-y-1">
                    <Button variant="ghost" className="justify-start w-[180px]">
                      <LogOut className="h-4" />
                      Logout
                    </Button>
                    <Button variant="ghost" className="justify-start w-[180px]">
                      <SwitchCamera className="h-4" />
                      Switch Account
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </nav>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        <div className="xl:hidden p-4 space-y-4">
          <div className="flex space-x-4">
            <DatePickerWithRange />
            <Select>
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
    </header>
  );
};

export default Header;