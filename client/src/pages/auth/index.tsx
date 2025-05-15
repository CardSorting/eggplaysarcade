import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad, Users, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const AuthSelectionPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to home if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="container py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Join Game Portal</h1>
            <p className="text-xl text-muted-foreground">
              Choose how you want to be part of our gaming community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="space-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Player Account</CardTitle>
                <CardDescription>
                  For gamers looking to play and discover new games
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Play free HTML5 games
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Create wishlists and favorites
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Rate and review games
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Track gaming stats and achievements
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => navigate('/auth/player')}
                >
                  Sign Up as Player
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="space-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Gamepad className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Developer Account</CardTitle>
                <CardDescription>
                  For game developers looking to publish their games
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Publish HTML5 games to our platform
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Access comprehensive analytics
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Manage and update your game portfolio
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Receive player feedback and reviews
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/auth/developer')}
                >
                  Sign Up as Developer
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center md:text-left">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => navigate('/auth/player')}
              >
                Log in
              </Button>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-2xl">
            <div className="flex justify-center mb-6">
              <Award className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4">
              Join the Ultimate Gaming Community
            </h2>
            <p className="text-lg text-center mb-6">
              Game Portal connects players and developers in a vibrant gaming ecosystem.
              Discover, play, and share amazing HTML5 games right in your browser.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Games</div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectionPage;