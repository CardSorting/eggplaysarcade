import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import UnauthorizedPage from "@/pages/unauthorized";
import AuthSelectionPage from "@/pages/auth";
import PlayerAuthPage from "@/pages/auth/player-auth";
import DeveloperAuthPage from "@/pages/auth/developer-auth";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import GameDetail from "@/pages/GameDetail";
import SubmitGame from "@/pages/SubmitGame";
import Dashboard from "@/pages/dashboard";
import Wishlist from "@/pages/Wishlist";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminOverview from "@/pages/dashboard/admin/Overview";
import GameSubmissions from "@/pages/dashboard/admin/GameSubmissions";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/games" component={Games} />
          <Route path="/games/:id" component={GameDetail} />
          
          {/* Protected routes */}
          <ProtectedRoute 
            path="/dashboard" 
            component={Dashboard} 
          />
          <ProtectedRoute 
            path="/dashboard/submit" 
            component={SubmitGame} 
            requiredPermission="submit_games" 
          />
          <ProtectedRoute 
            path="/dashboard/profile" 
            component={Dashboard} 
          />
          <ProtectedRoute 
            path="/dashboard/analytics" 
            component={Dashboard} 
          />
          <ProtectedRoute 
            path="/dashboard/mygames" 
            component={Dashboard} 
          />
          <ProtectedRoute 
            path="/wishlist" 
            component={Wishlist} 
          />
          
          {/* Admin routes */}
          <ProtectedRoute 
            path="/dashboard/admin/overview" 
            component={AdminOverview} 
            requiredPermission="manage_games" 
          />
          <ProtectedRoute 
            path="/dashboard/admin/submissions" 
            component={GameSubmissions} 
            requiredPermission="manage_games" 
          />
          
          {/* Auth and error pages */}
          <Route path="/auth" component={AuthSelectionPage} />
          <Route path="/auth/player" component={PlayerAuthPage} />
          <Route path="/auth/developer" component={DeveloperAuthPage} />
          <Route path="/unauthorized" component={UnauthorizedPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
