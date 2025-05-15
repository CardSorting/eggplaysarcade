import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, LogOut, Settings, Gamepad2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GameControllerIcon, GamesLogo } from "@/lib/icons";

const Header = () => {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user, hasPermission, logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/games?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Base navigation links available to all users
  const baseNavLinks = [
    { name: "Home", path: "/" },
    { name: "Games", path: "/games" },
    { name: "Categories", path: "/games" }
  ];
  
  // Add Submit Game link if user has permission
  const navLinks = [
    ...baseNavLinks,
    ...(hasPermission("submit_games") 
      ? [{ name: "Submit Game", path: "/dashboard/submit" }] 
      : [])
  ];

  return (
    <header className="bg-background border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer">
            <GamesLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className={`nav-link text-white hover:text-accent font-medium ${
                  (location === link.path || 
                  (link.path !== "/" && location.startsWith(link.path))) ? 
                  "text-accent active" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i className={`ri-${mobileMenuOpen ? "close" : "menu"}-line text-2xl`}></i>
            </Button>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search games..."
                className="rounded-full border-gray-800 bg-muted pl-4 pr-10 w-[200px] focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {user ? (
              // User is logged in - show user menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show login button
              <Button
                onClick={handleSignIn}
                className="bg-primary hover:bg-primary/90 text-white rounded-full btn-primary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className="block py-2 text-white hover:text-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-3">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search games..."
                  className="w-full rounded-full border-gray-800 bg-muted pl-4 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full rounded-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button
                onClick={handleSignIn}
                className="bg-primary hover:bg-primary/90 text-white py-2 rounded-full"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
