import * as React from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Admin registration form schema
const adminAuthSchema = z
  .object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    role: z.literal(UserRole.ADMIN),
    displayName: z.string().min(3, {
      message: "Display name must be at least 3 characters.",
    }),
    adminKey: z.string().min(8, {
      message: "Admin security key is required."
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type LoginValues = z.infer<typeof loginSchema>;
type AdminAuthValues = z.infer<typeof adminAuthSchema>;

const AdminAuthPage = () => {
  const [activeTab, setActiveTab] = React.useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [adminKeyValid, setAdminKeyValid] = React.useState(false);

  // Redirect to home if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Registration form
  const registerForm = useForm<AdminAuthValues>({
    resolver: zodResolver(adminAuthSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      role: UserRole.ADMIN,
      displayName: "",
      adminKey: "",
    },
  });

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onRegisterSubmit = (values: AdminAuthValues) => {
    // In a real implementation, you would verify the admin key server-side
    if (values.adminKey !== "admin-secret-key") {
      setAdminKeyValid(false);
      return;
    }
    
    setAdminKeyValid(true);
    
    // Remove confirmPassword and adminKey before sending to API
    const { confirmPassword, adminKey, ...registerData } = values;
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
          onClick={() => navigate("/auth")}
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
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Admin Portal</h1>
            <p className="text-muted-foreground text-center mb-4">
              Secure access for system administrators
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
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
                          <Input placeholder="admin_username" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be your administrator login.
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
                          <Input placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for account recovery and notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
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
                  </div>

                  {/* Admin Specific Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Admin Profile</h3>
                    
                    <FormField
                      control={registerForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="System Administrator" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your name as it will appear throughout the system.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="adminKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Security Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the administrator security key provided by the system.
                          </FormDescription>
                          <FormMessage />
                          {!adminKeyValid && registerForm.formState.isSubmitted && (
                            <p className="text-sm font-medium text-destructive mt-1">
                              Invalid administrator key.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create Admin Account'}
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
                          <Input placeholder="admin" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
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
                    {loginMutation.isPending ? 'Logging in...' : 'Login to Admin Portal'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Info */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-card rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Administrator Access</h2>
            <p className="text-muted-foreground mb-4">
              This portal provides access to system administration features including:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                User management and moderation
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                Game publishing approval and review
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                Platform analytics and reporting
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                Category and tag management
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                System configuration and settings
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Administrator accounts require approval and are strictly monitored for security purposes.
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you're unable to access your administrator account or need assistance:
            </p>
            <Button variant="outline" className="w-full">
              Contact System Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;