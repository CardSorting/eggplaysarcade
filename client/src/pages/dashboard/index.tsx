import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import DeveloperDashboard from "./DeveloperDashboard";
import PlayerDashboard from "./PlayerDashboard";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  // If no user is logged in, this should not happen due to ProtectedRoute
  // but we'll include it for safety
  if (!user) {
    return null;
  }
  
  // Render the appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
      
    case UserRole.GAME_DEVELOPER:
      return <DeveloperDashboard />;
      
    case UserRole.PLAYER:
    default:
      return <PlayerDashboard />;
  }
}