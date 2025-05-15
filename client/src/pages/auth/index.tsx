import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from './../../components/ui/layout';
import { Gamepad2, Users, CodeXml } from "lucide-react";

/**
 * AuthSelectionPage
 * 
 * This page allows users to choose between player and game developer registration/login.
 * It serves as an entry point to the appropriate authentication flow based on user type.
 */
export default function AuthSelectionPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Redirect to home if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="container max-w-6xl py-10">
        <div className="flex flex-col items-center justify-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Join the Gaming Revolution</h1>
          <p className="text-muted-foreground mt-2 text-center max-w-2xl">
            Choose your path: Are you here to discover and play amazing games, or are you a developer ready to showcase your creations?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Player Card */}
          <Card className="border-2 hover:border-primary/80 transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                <Gamepad2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Player</CardTitle>
              <CardDescription>
                Join as a player to discover and enjoy HTML5 games
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Discover trending games
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Rate and review games
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Create a personalized wishlist
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Earn badges and achievements
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate("/auth/player")}
              >
                Continue as Player
              </Button>
            </CardFooter>
          </Card>

          {/* Developer Card */}
          <Card className="border-2 hover:border-primary/80 transition-all">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                <CodeXml className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Game Developer</CardTitle>
              <CardDescription>
                Join as a developer to publish and showcase your games
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Upload and manage your games
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Receive player feedback
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Track game performance
                </li>
                <li className="flex items-center justify-center">
                  <span className="mr-2">✓</span> Join the developer community
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate("/auth/developer")}
                variant="secondary"
              >
                Continue as Developer
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </Layout>
  );
}