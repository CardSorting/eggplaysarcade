import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";

/**
 * Dashboard router component that directs users to the appropriate
 * dashboard based on their role
 */
export default function DashboardRouter() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user is loaded and is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // If no user, return null (the useEffect will handle redirection)
  if (!user) {
    return null;
  }

  // Direct to the appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
      
    case UserRole.GAME_DEVELOPER:
      // For now just using the admin dashboard as placeholder
      // In the future, implement a separate DeveloperDashboard component
      return <AdminDashboard />;
      
    case UserRole.PLAYER:
      // For now just using the admin dashboard as placeholder
      // In the future, implement a separate PlayerDashboard component
      return <AdminDashboard />;
      
    default:
      // If role is not recognized, redirect to home
      setLocation("/");
      return null;
  }
}