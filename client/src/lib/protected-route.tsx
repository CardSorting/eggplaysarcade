import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Permission } from "./types";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  requiredPermission?: Permission;
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredPermission
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Not logged in, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // User is logged in but doesn't have the required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Route path={path}>
        <Redirect to="/unauthorized" />
      </Route>
    );
  }

  // User is logged in and has the required permission (or no permission is required)
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}