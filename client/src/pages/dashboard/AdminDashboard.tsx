import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Users, 
  GameController, 
  BarChart3, 
  Tag 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { getQueryFn } from "@/lib/queryClient";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Redirect if not an admin
  if (user && user.role !== UserRole.ADMIN) {
    return <Redirect to="/dashboard" />;
  }
  
  // Stats queries
  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/stats/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: gameStats, isLoading: isLoadingGames } = useQuery({
    queryKey: ["/api/stats/games"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: categoryStats, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/stats/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const isLoading = isLoadingUsers || isLoadingGames || isLoadingCategories;
  
  const stats = [
    {
      title: "Total Users",
      value: userStats?.total || 0,
      description: "Active users on the platform",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      change: userStats?.percentChange || 0
    },
    {
      title: "Games Published",
      value: gameStats?.total || 0,
      description: "Games hosted on the platform",
      icon: <GameController className="h-5 w-5 text-muted-foreground" />,
      change: gameStats?.percentChange || 0
    },
    {
      title: "Categories",
      value: categoryStats?.total || 0,
      description: "Game categories available",
      icon: <Tag className="h-5 w-5 text-muted-foreground" />,
      change: 0
    },
    {
      title: "Total Plays",
      value: gameStats?.totalPlays || 0,
      description: "Games played this month",
      icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />,
      change: gameStats?.playsPercentChange || 0
    }
  ];

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}. Here's an overview of platform activity.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  {stat.change !== 0 && (
                    <p className={`text-xs mt-1 ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}% from last month
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest activities across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Activity content here */}
              <p className="text-sm text-muted-foreground">
                No recent activities to display
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>
                Most active game categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category stats here */}
              <p className="text-sm text-muted-foreground">
                No category data available
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}