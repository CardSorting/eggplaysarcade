import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertPlayerSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@shared/schema';

// Extended schema with validation rules
const playerAuthSchema = insertPlayerSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Relaxed schema for login
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type PlayerAuthValues = z.infer<typeof playerAuthSchema>;
type LoginValues = z.infer<typeof loginSchema>;

const PlayerAuthPage = () => {
  const [activeTab, setActiveTab] = React.useState<string>('register');
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to home if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Registration form
  const registerForm = useForm<PlayerAuthValues>({
    resolver: zodResolver(playerAuthSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      role: UserRole.PLAYER,
      displayName: '',
    },
  });

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onRegisterSubmit = (values: PlayerAuthValues) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="container mx-auto py-8 md:py-16 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => navigate('/auth')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 justify-center">
        {/* Left column - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 bg-card rounded-xl p-6 shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Player Account</h1>
            <p className="text-muted-foreground text-center mb-4">
              Play, rate, and discover amazing HTML5 games
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-0 space-y-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be your public username.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your display name can be different from your username.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll never share your email with anyone else.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create Player Account'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="login" className="mt-0 space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Features */}
        <div className="hidden lg:block lg:flex-1 max-w-xl">
          <Card className="bg-primary text-white border-0 overflow-hidden h-full">
            <CardContent className="relative z-10 flex flex-col justify-center h-full p-10">
              <div className="max-w-md mx-auto text-center space-y-6">
                <h2 className="text-3xl font-bold">Discover Amazing Games</h2>
                <p className="text-lg text-white/80">
                  With a player account, you'll be able to:
                </p>
                <ul className="text-left space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Play Instantly</h3>
                      <p className="text-white/70 text-sm">No downloads required. Play directly in your browser.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Track Your Progress</h3>
                      <p className="text-white/70 text-sm">Save your game progress and continue where you left off.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Rate & Review</h3>
                      <p className="text-white/70 text-sm">Share your opinions and help others find great games.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Join the Community</h3>
                      <p className="text-white/70 text-sm">Connect with other gamers who share your interests.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayerAuthPage;