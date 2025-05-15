import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types";
import AdminDashboard from "./AdminDashboard";
import DeveloperDashboard from "./DeveloperDashboard";
import PlayerDashboard from "./PlayerDashboard";

/**
 * Dashboard router component that directs users to the appropriate dashboard
 * based on their role.
 */
export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // This should never happen due to the ProtectedRoute,
  // but we handle it just in case
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
      return <PlayerDashboard />;
    default:
      // Fallback to player dashboard if role is unknown
      return <PlayerDashboard />;
  }
}