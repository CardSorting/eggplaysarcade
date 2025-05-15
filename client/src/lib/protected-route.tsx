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
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (requiredPermission && !hasPermission(requiredPermission)) {
          return <Redirect to="/unauthorized" />;
        }

        return <Component />;
      }}
    </Route>
  );
}