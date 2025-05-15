import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameControllerIcon } from "@/lib/icons";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Code } from "lucide-react";

/**
 * Game Developer-specific authentication page
 */
const DeveloperAuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({
      username: loginUsername,
      password: loginPassword,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      username: registerUsername,
      password: registerPassword,
      email: registerEmail || undefined,
      displayName: displayName || companyName || undefined,
      role: UserRole.GAME_DEVELOPER,
      companyName: companyName || undefined,
      portfolio: portfolio || undefined
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Auth Form Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                className="p-0 mr-2"
                onClick={() => navigate("/auth")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold text-center flex-1">
                Developer Account
              </CardTitle>
            </div>
            <CardDescription className="text-center">
              Sign in to submit and manage your games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      placeholder="Enter your username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      placeholder="Choose a username"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company/Studio Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Your game studio name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name (Optional)</Label>
                    <Input
                      id="display-name"
                      placeholder="How you'll appear to others"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Your email address"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio/Website URL (Optional)</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://yourstudio.com"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a secure password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Developer Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Hero Section Column */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white flex-col justify-center items-center p-8">
        <div className="max-w-md text-center">
          <Code className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Join as a Developer</h1>
          <p className="text-lg mb-6">
            Showcase your HTML5 games to our growing community of players.
            Get analytics, feedback, and build your audience.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Publish Games</h3>
              <p className="text-sm">Share your HTML5 games with our engaged player community</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Analytics</h3>
              <p className="text-sm">Track plays, ratings, and user engagement with your games</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Developer Tools</h3>
              <p className="text-sm">Access APIs, SDKs and tools to enhance your game development</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Community</h3>
              <p className="text-sm">Connect with other developers and grow your audience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperAuthPage;