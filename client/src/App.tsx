import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import UnauthorizedPage from "@/pages/unauthorized";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import GameDetailPage from "@/pages/GameDetailPage";
import SubmitGame from "@/pages/SubmitGame";
import Dashboard from "@/pages/dashboard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/games" component={Games} />
          <Route path="/games/:id" component={GameDetailPage} />
          
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
          
          {/* Auth and error pages */}
          <Route path="/auth" component={AuthPage} />
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
