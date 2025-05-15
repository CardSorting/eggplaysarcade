import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Users, 
  Settings, 
  Tags, 
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItemProps {
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
}

const NavItem = ({ label, icon, href, active }: NavItemProps) => {
  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          active ? "bg-secondary" : "hover:bg-secondary/50"
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Navigation items based on user role
  let navItems = [];
  
  if (user?.role === UserRole.ADMIN) {
    navItems = [
      { label: "Overview", icon: <LayoutDashboard size={16} />, href: "/dashboard", active: activeTab === "overview" },
      { label: "Users", icon: <Users size={16} />, href: "/dashboard/users", active: activeTab === "users" },
      { label: "Games", icon: <Gamepad2 size={16} />, href: "/dashboard/games", active: activeTab === "games" },
      { label: "Categories", icon: <Tags size={16} />, href: "/dashboard/categories", active: activeTab === "categories" },
      { label: "Settings", icon: <Settings size={16} />, href: "/dashboard/settings", active: activeTab === "settings" }
    ];
  } else if (user?.role === UserRole.GAME_DEVELOPER) {
    navItems = [
      { label: "My Games", icon: <Gamepad2 size={16} />, href: "/dashboard", active: activeTab === "my games" },
      { label: "Analytics", icon: <LayoutDashboard size={16} />, href: "/dashboard/analytics", active: activeTab === "analytics" },
      { label: "Profile", icon: <User size={16} />, href: "/dashboard/profile", active: activeTab === "profile" }
    ];
  } else {
    // Player role
    navItems = [
      { label: "My Games", icon: <Gamepad2 size={16} />, href: "/dashboard", active: activeTab === "my games" },
      { label: "Profile", icon: <User size={16} />, href: "/dashboard/profile", active: activeTab === "profile" }
    ];
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-6">
          <Link href="/">
            <h2 className="text-2xl font-bold tracking-tight">Game Platform</h2>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Dashboard</p>
        </div>
        
        <div className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item, i) => (
            <NavItem
              key={i}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={item.active}
            />
          ))}
        </div>
        
        <div className="p-4 mt-auto border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut size={16} />
            Log Out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {/* Mobile header */}
        <header className="md:hidden border-b p-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h2 className="text-xl font-bold">Game Platform</h2>
            </Link>
            {/* Mobile menu button would go here */}
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};