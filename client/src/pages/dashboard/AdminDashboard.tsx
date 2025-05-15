import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, Plus, BarChart3, ListTodo, GamepadIcon } from "lucide-react";
import { Link } from "wouter";

// Type definitions for the dashboard data
interface DashboardStatistics {
  totalUsers: number;
  gamesPublished: number;
  categoriesCount: number;
  totalGamePlays: number;
  userGrowth: string;
  gameGrowth: string;
  playsGrowth: string;
}

interface CategoryData {
  id: number;
  name: string;
  gameCount: number;
  percentage: number;
}

interface DashboardData {
  statistics: DashboardStatistics;
  topCategories: CategoryData[];
  recentGames: any[]; // We'll define this more precisely if needed
}

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/admin/dashboard'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  return (
    <DashboardLayout activeTab="dashboard">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/dashboard/submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading dashboard data...</span>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                <p>Error loading dashboard data. Please try again later.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.statistics.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {data?.statistics.userGrowth || "+0.0%"} from last month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Games Published
                      </CardTitle>
                      <GamepadIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.statistics.gamesPublished || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {data?.statistics.gameGrowth || "+0.0%"} from last month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Categories
                      </CardTitle>
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{data?.statistics.categoriesCount || 0}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Total Game Plays</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="text-2xl font-bold mb-2">
                        {data?.statistics.totalGamePlays.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        {data?.statistics.playsGrowth || "+0.0%"} from last month
                      </p>
                      <div className="h-[200px] flex items-center justify-center">
                        <BarChart3 className="h-16 w-16 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">Interactive chart will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Top Categories</CardTitle>
                      <CardDescription>
                        Most popular game categories this month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data?.topCategories && data.topCategories.length > 0 ? (
                          data.topCategories.map((category) => (
                            <div className="flex items-center" key={category.id}>
                              <div className="w-[30%] font-medium">{category.name}</div>
                              <div className="w-[55%] bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: `${category.percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-[15%] text-right text-sm">{category.percentage}%</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No categories found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mt-4">Analytics dashboard will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}