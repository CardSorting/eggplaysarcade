import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileBarChart, 
  GamepadIcon, 
  LogOut, 
  ListTodo, 
  StarIcon,
  BookMarked,
  User,
  Trophy
} from "lucide-react";
import { UserRole } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItemProps {
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
}

// Extended navigation item interface with key property
interface NavItem extends NavItemProps {
  key?: string;
}

const NavItem = ({ label, icon, href, active }: NavItemProps) => {
  return (
    <div className="w-full py-1">
      <Link 
        href={href}
        className={cn(
          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
          active 
            ? "bg-secondary text-secondary-foreground font-medium" 
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        )}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </Link>
    </div>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: "/dashboard",
        key: "dashboard"
      }
    ];
    
    if (!user) return commonItems;
    
    // Admin-specific navigation items
    if (user.role === UserRole.ADMIN) {
      return [
        ...commonItems,
        {
          label: "Users",
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/users",
        },
        {
          label: "Games",
          icon: <GamepadIcon className="h-5 w-5" />,
          href: "/dashboard/games",
        },
        {
          label: "Categories",
          icon: <ListTodo className="h-5 w-5" />,
          href: "/dashboard/categories",
        },
        {
          label: "Analytics",
          icon: <FileBarChart className="h-5 w-5" />,
          href: "/dashboard/analytics",
        },
        {
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
          href: "/dashboard/settings",
        }
      ];
    }
    
    // Game Developer navigation
    if (user.role === UserRole.GAME_DEVELOPER) {
      return [
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          key: "dashboard"
        },
        {
          label: "My Games",
          icon: <GamepadIcon className="h-5 w-5" />,
          href: "/dashboard/mygames",
          key: "mygames"
        },
        {
          label: "Submit Game",
          icon: <FileBarChart className="h-5 w-5" />,
          href: "/dashboard/submit",
          key: "submit"
        },
        {
          label: "Analytics",
          icon: <FileBarChart className="h-5 w-5" />,
          href: "/dashboard/analytics",
          key: "analytics"
        },
        {
          label: "Profile",
          icon: <User className="h-5 w-5" />,
          href: "/dashboard/profile",
          key: "profile"
        }
      ];
    }
    
    // Player navigation
    return [
      ...commonItems,
      {
        label: "Favorites",
        icon: <StarIcon className="h-5 w-5" />,
        href: "/dashboard/favorites",
      },
      {
        label: "Achievements",
        icon: <Trophy className="h-5 w-5" />,
        href: "/dashboard/achievements",
      },
      {
        label: "Library",
        icon: <BookMarked className="h-5 w-5" />,
        href: "/dashboard/library",
      },
      {
        label: "Profile",
        icon: <User className="h-5 w-5" />,
        href: "/dashboard/profile",
      }
    ];
  };
  
  const navItems = getNavItems();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background border-b py-2 px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <GamepadIcon className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-semibold">Game Portal</span>
          </Link>
          
          {/* User info and logout */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                  <AvatarFallback>
                    {user.username?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col mr-4">
                  <span className="font-medium text-sm">{user.username}</span>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1 rounded-md text-red-500 hover:bg-red-100/20 transition-colors"
              >
                <LogOut className="h-4 w-4 inline-block mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};