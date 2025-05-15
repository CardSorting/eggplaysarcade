import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gamepad2,
  Search, 
  User, 
  LogOut, 
  Settings, 
  Home, 
  Grid3X3, 
  Star, 
  TrendingUp,
  Upload, 
  Bell,
  Heart
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GamesLogo } from "@/lib/icons";
import { Category } from "@shared/schema";

const Header = () => {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  const { user, hasPermission, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Base navigation structure for app store experience
  const mainNavItems = [
    { 
      name: "Home", 
      path: "/", 
      icon: <Home className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Games", 
      path: "/games", 
      icon: <Gamepad2 className="w-5 h-5 mr-2" />,
      subItems: [
        { name: "All Games", path: "/games", icon: <Grid3X3 className="w-4 h-4 mr-2" /> },
        { name: "Top Rated", path: "/games?sort=rating", icon: <Star className="w-4 h-4 mr-2" /> },
        { name: "Popular", path: "/games?sort=players", icon: <TrendingUp className="w-4 h-4 mr-2" /> },
        { name: "New Releases", path: "/games?sort=new", icon: <Badge className="w-4 h-4 mr-2" variant="outline">NEW</Badge> }
      ]
    },
    { 
      name: "Categories", 
      path: "/categories", 
      icon: <Grid3X3 className="w-5 h-5 mr-2" />,
      hasCategories: true
    }
  ];
  
  // Add wishlist item if user is authenticated
  const userNavItems = user 
    ? [{ 
        name: "Wishlist", 
        path: "/wishlist", 
        icon: <Heart className="w-5 h-5 mr-2" /> 
      }] 
    : [];
  
  // Add developer specific items if the user has permission
  const developerNavItems = hasPermission("submit_games") 
    ? [{ 
        name: "Developer", 
        path: "/dashboard", 
        icon: <Upload className="w-5 h-5 mr-2" />,
        subItems: [
          { name: "My Dashboard", path: "/dashboard", icon: <Gamepad2 className="w-4 h-4 mr-2" /> },
          { name: "Submit Game", path: "/dashboard/submit", icon: <Upload className="w-4 h-4 mr-2" /> },
          { name: "My Games", path: "/dashboard/games", icon: <Grid3X3 className="w-4 h-4 mr-2" /> },
          { name: "Analytics", path: "/dashboard/analytics", icon: <TrendingUp className="w-4 h-4 mr-2" /> }
        ]
      }] 
    : [];

  // Combine navigation items
  const navItems = [...mainNavItems, ...developerNavItems];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      isScrolled ? "bg-background/95 backdrop-blur-sm border-b shadow-sm" : "bg-background border-b border-gray-800"
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center cursor-pointer mr-8">
              <GamesLogo />
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {navItems.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      {item.subItems || item.hasCategories ? (
                        <>
                          <NavigationMenuTrigger className="bg-transparent hover:bg-accent/20">
                            <div className="flex items-center">
                              {item.icon}
                              {item.name}
                            </div>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="w-[400px] p-4">
                              <div className="font-medium mb-2 text-lg">{item.name}</div>
                              {item.hasCategories ? (
                                <div className="grid grid-cols-2 gap-3 p-2">
                                  {categories.map(category => (
                                    <Link 
                                      key={category.id} 
                                      href={`/games?category=${category.id}`}
                                      className="flex items-center p-2 rounded-md hover:bg-accent/20"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      <i className={`${category.icon} mr-2 text-accent`}></i>
                                      {category.name}
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <ul className="grid gap-3 p-2">
                                  {item.subItems?.map((subItem) => (
                                    <li key={subItem.name}>
                                      <NavigationMenuLink asChild>
                                        <Link
                                          href={subItem.path}
                                          className="flex items-center p-2 rounded-md hover:bg-accent/20"
                                        >
                                          {subItem.icon}
                                          <div className="ml-2">
                                            <div className="font-medium">{subItem.name}</div>
                                          </div>
                                        </Link>
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <Link 
                          href={item.path}
                          className={`flex items-center px-4 py-2 rounded-md ${
                            location === item.path ? 
                            "text-accent font-medium" : 
                            "text-foreground hover:text-accent"
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

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
                className="rounded-full border-gray-800 bg-muted pl-4 pr-10 w-[250px] focus-visible:ring-primary"
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
              <div className="flex items-center space-x-3">
                {/* Wishlist Button */}
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/wishlist")}>
                  <Heart className="h-5 w-5" />
                </Button>
                
                {/* Notifications Button */}
                <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => navigate("/notifications")}>
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    3
                  </span>
                </Button>
                
                {/* User Menu */}
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
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <Gamepad2 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
          <div className="md:hidden mt-4 pb-4 bg-background border-t border-gray-800 pt-4 absolute left-0 right-0 z-50 shadow-lg px-4">
            <ScrollArea className="h-[60vh]">
              <div className="pr-4">
                {navItems.map((item) => (
                  <div key={item.name} className="mb-3">
                    {item.subItems || item.hasCategories ? (
                      <>
                        <div className="font-medium text-lg flex items-center mb-2">
                          {item.icon}
                          {item.name}
                        </div>
                        <div className="ml-8 space-y-2">
                          {item.hasCategories ? (
                            <div className="space-y-2">
                              {categories.map(category => (
                                <Link 
                                  key={category.id} 
                                  href={`/games?category=${category.id}`}
                                  className="flex items-center py-1"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <i className={`${category.icon} mr-2 text-accent`}></i>
                                  {category.name}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {item.subItems?.map((subItem) => (
                                <Link 
                                  key={subItem.name}
                                  href={subItem.path}
                                  className="flex items-center py-1"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.icon}
                                  <span className="ml-2">{subItem.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <Link 
                        href={item.path}
                        className={`flex items-center py-2 font-medium text-lg ${
                          location === item.path ? "text-accent" : "text-foreground" 
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <form onSubmit={handleSearch} className="relative mb-4">
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
                  
                  {user ? (
                    <>
                      <div className="flex items-center space-x-2 p-2 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.username}</span>
                          <span className="text-xs text-muted-foreground">{user.role}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/dashboard");
                        }}>
                          <Gamepad2 className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Button>
                        
                        <Button variant="ghost" className="w-full justify-start" onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/profile");
                        }}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start" onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/wishlist");
                        }}>
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Wishlist</span>
                        </Button>
                        
                        <Button variant="ghost" className="w-full justify-start" onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/settings");
                        }}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          className="w-full mt-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignIn();
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-full"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
