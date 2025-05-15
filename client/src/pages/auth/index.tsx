import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameControllerIcon } from "@/lib/icons";
import { Code, Users } from "lucide-react";

/**
 * Main authentication selection page
 * This serves as the entry point for users to choose between player or developer registration
 */
const AuthSelectionPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-8">
            <GameControllerIcon />
            <h1 className="text-4xl font-bold mt-4">Join GamePortal</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Choose how you want to join our gaming community
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Player Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-6 w-6" />
                  Join as a Player
                </CardTitle>
                <CardDescription>
                  Create an account to play, rate, and save games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Access hundreds of free games</li>
                    <li>Track your favorites and create playlists</li>
                    <li>Rate and review games</li>
                    <li>Join the player community</li>
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/auth/player")}
                  >
                    Continue as Player
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Developer Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-6 w-6" />
                  Join as a Developer
                </CardTitle>
                <CardDescription>
                  Share your games with our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Submit your HTML5 games</li>
                    <li>Get player feedback and ratings</li>
                    <li>Track analytics and engagement</li>
                    <li>Connect with a growing audience</li>
                  </ul>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate("/auth/developer")}
                  >
                    Continue as Developer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => navigate("/auth/player")}
              >
                Log in here
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectionPage;