import { ReactNode } from "react";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  User, 
  Gamepad2, 
  BarChart3, 
  Settings, 
  LogOut,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";

interface NavItemProps {
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
}

const NavItem = ({ label, icon, href, active }: NavItemProps) => {
  const [, navigate] = useLocation();

  return (
    <Button
      variant={active ? "default" : "ghost"}
      className="w-full justify-start gap-3 mb-1"
      onClick={() => navigate(href)}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/auth")
    });
  };

  const renderNavigation = () => {
    // Common navigation items for all roles
    const commonNav = [
      { 
        label: "Profile", 
        icon: <User size={18} />, 
        href: "/dashboard/profile", 
        showFor: [UserRole.ADMIN, UserRole.GAME_DEVELOPER, UserRole.PLAYER]
      },
    ];

    // Admin-specific navigation
    const adminNav = [
      { 
        label: "Overview", 
        icon: <LayoutDashboard size={18} />, 
        href: "/dashboard", 
        showFor: [UserRole.ADMIN]
      },
      { 
        label: "Users", 
        icon: <Users size={18} />, 
        href: "/dashboard/users", 
        showFor: [UserRole.ADMIN]
      },
      { 
        label: "Content", 
        icon: <Gamepad2 size={18} />, 
        href: "/dashboard/content", 
        showFor: [UserRole.ADMIN]
      },
      { 
        label: "Analytics", 
        icon: <BarChart3 size={18} />, 
        href: "/dashboard/analytics", 
        showFor: [UserRole.ADMIN]
      },
      { 
        label: "Settings", 
        icon: <Settings size={18} />, 
        href: "/dashboard/settings", 
        showFor: [UserRole.ADMIN]
      }
    ];

    // Game Developer specific navigation
    const developerNav = [
      { 
        label: "My Games", 
        icon: <Gamepad2 size={18} />, 
        href: "/dashboard", 
        showFor: [UserRole.GAME_DEVELOPER]
      },
      { 
        label: "Submit Game", 
        icon: <Gamepad2 size={18} />, 
        href: "/dashboard/submit", 
        showFor: [UserRole.GAME_DEVELOPER]
      },
      { 
        label: "Analytics", 
        icon: <BarChart3 size={18} />, 
        href: "/dashboard/analytics", 
        showFor: [UserRole.GAME_DEVELOPER]
      }
    ];

    // Player specific navigation
    const playerNav = [
      { 
        label: "My Games", 
        icon: <Gamepad2 size={18} />, 
        href: "/dashboard", 
        showFor: [UserRole.PLAYER]
      },
      { 
        label: "Favorites", 
        icon: <Gamepad2 size={18} />, 
        href: "/dashboard/favorites", 
        showFor: [UserRole.PLAYER]
      }
    ];

    // Combine all navigation items and filter based on user role
    const allNav = [...commonNav, ...adminNav, ...developerNav, ...playerNav];
    return allNav
      .filter(item => item.showFor.includes(user?.role as UserRole))
      .map(item => (
        <NavItem 
          key={item.href}
          label={item.label}
          icon={item.icon}
          href={item.href}
          active={activeTab === item.label.toLowerCase()}
        />
      ));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border h-full flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">GameVault</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.role === UserRole.ADMIN && "Admin Dashboard"}
            {user?.role === UserRole.GAME_DEVELOPER && "Developer Dashboard"}
            {user?.role === UserRole.PLAYER && "Player Dashboard"}
          </p>
        </div>
        <Separator />
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {renderNavigation()}
          </nav>
        </div>
        <div className="p-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};