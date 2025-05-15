import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart as BarChartIcon, 
  Users, 
  Gamepad, 
  DollarSign, 
  TrendingUp, 
  Activity,
  User,
  AlertTriangle,
  Layers,
  PieChart as PieChartIcon,
  Calendar,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { format, subDays } from "date-fns";
import { SubmissionStatus } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Stats card component
const StatsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendLabel,
  link,
  linkLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
  link?: string;
  linkLabel?: string;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend !== undefined && (
                <span
                  className={`ml-2 text-sm font-medium ${
                    trend >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trendLabel && (
              <p className="text-xs text-muted-foreground">{trendLabel}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
        {link && (
          <div className="mt-4">
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href={link}>
                {linkLabel || "View Details"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Recent activity card
const RecentActivityCard = ({ 
  activities 
}: { 
  activities: { 
    id: string; 
    type: string; 
    details: string; 
    timestamp: Date; 
    user?: { 
      id: string; 
      username: string; 
    };
  }[] 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                {activity.type === 'user_registration' && <User className="h-4 w-4 text-primary" />}
                {activity.type === 'game_submission' && <Gamepad className="h-4 w-4 text-primary" />}
                {activity.type === 'game_approval' && <Layers className="h-4 w-4 text-primary" />}
                {activity.type === 'game_rejection' && <AlertTriangle className="h-4 w-4 text-primary" />}
                {activity.type === 'game_play' && <Activity className="h-4 w-4 text-primary" />}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{activity.details}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</span>
                  {activity.user && (
                    <>
                      <span>•</span>
                      <span>{activity.user.username}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Color constants for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const SUBMISSION_STATUS_COLORS = {
  [SubmissionStatus.SUBMITTED]: "#FFBB28",
  [SubmissionStatus.IN_REVIEW]: "#8884D8",
  [SubmissionStatus.APPROVED]: "#00C49F",
  [SubmissionStatus.REJECTED]: "#FF8042",
  [SubmissionStatus.PUBLISHED]: "#0088FE",
  [SubmissionStatus.DRAFT]: "#82ca9d",
};

const AdminDashboardOverview = () => {
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "90days">("30days");
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard', timeframe],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Mock data for demo
  const mockData = {
    stats: {
      totalGames: 156,
      totalUsers: 4289,
      totalGamePlays: 58742,
      totalRevenue: 12465.82,
      pendingSubmissions: 8,
      activeUsers: 1245,
      conversionRate: 2.8,
      trends: {
        gamesGrowth: 12,
        usersGrowth: 15,
        revenueGrowth: 8,
        playsGrowth: 22
      }
    },
    charts: {
      userGrowth: [
        { date: format(subDays(new Date(), 30), 'MMM d'), users: 4100 },
        { date: format(subDays(new Date(), 27), 'MMM d'), users: 4126 },
        { date: format(subDays(new Date(), 24), 'MMM d'), users: 4152 },
        { date: format(subDays(new Date(), 21), 'MMM d'), users: 4179 },
        { date: format(subDays(new Date(), 18), 'MMM d'), users: 4195 },
        { date: format(subDays(new Date(), 15), 'MMM d'), users: 4211 },
        { date: format(subDays(new Date(), 12), 'MMM d'), users: 4225 },
        { date: format(subDays(new Date(), 9), 'MMM d'), users: 4240 },
        { date: format(subDays(new Date(), 6), 'MMM d'), users: 4262 },
        { date: format(subDays(new Date(), 3), 'MMM d'), users: 4275 },
        { date: format(new Date(), 'MMM d'), users: 4289 }
      ],
      gamePlays: [
        { date: format(subDays(new Date(), 30), 'MMM d'), plays: 1450 },
        { date: format(subDays(new Date(), 27), 'MMM d'), plays: 1860 },
        { date: format(subDays(new Date(), 24), 'MMM d'), plays: 1250 },
        { date: format(subDays(new Date(), 21), 'MMM d'), plays: 1420 },
        { date: format(subDays(new Date(), 18), 'MMM d'), plays: 1850 },
        { date: format(subDays(new Date(), 15), 'MMM d'), plays: 2100 },
        { date: format(subDays(new Date(), 12), 'MMM d'), plays: 1680 },
        { date: format(subDays(new Date(), 9), 'MMM d'), plays: 1950 },
        { date: format(subDays(new Date(), 6), 'MMM d'), plays: 2300 },
        { date: format(subDays(new Date(), 3), 'MMM d'), plays: 2100 },
        { date: format(new Date(), 'MMM d'), plays: 2450 }
      ],
      categoryDistribution: [
        { name: "Action", value: 42 },
        { name: "Puzzle", value: 28 },
        { name: "Strategy", value: 21 },
        { name: "Adventure", value: 18 },
        { name: "Racing", value: 15 },
        { name: "Sports", value: 12 },
        { name: "RPG", value: 10 },
        { name: "Simulation", value: 8 },
        { name: "Other", value: 2 }
      ],
      submissionStatus: [
        { name: "Published", value: 125, status: SubmissionStatus.PUBLISHED },
        { name: "Approved", value: 15, status: SubmissionStatus.APPROVED },
        { name: "In Review", value: 8, status: SubmissionStatus.IN_REVIEW },
        { name: "Pending", value: 4, status: SubmissionStatus.SUBMITTED },
        { name: "Rejected", value: 12, status: SubmissionStatus.REJECTED },
        { name: "Draft", value: 18, status: SubmissionStatus.DRAFT }
      ],
      topGames: [
        { name: "Block Puzzle", plays: 8540, revenue: 2850 },
        { name: "Space Shooter", plays: 6250, revenue: 1980 },
        { name: "Racing Champions", plays: 5120, revenue: 1650 },
        { name: "Chess Master", plays: 4580, revenue: 1420 },
        { name: "Zombie Survival", plays: 3950, revenue: 1280 }
      ],
      userRoles: [
        { name: "Players", value: 3950 },
        { name: "Developers", value: 320 },
        { name: "Admins", value: 19 }
      ],
      revenue: [
        { date: format(subDays(new Date(), 30), 'MMM d'), revenue: 350 },
        { date: format(subDays(new Date(), 27), 'MMM d'), revenue: 420 },
        { date: format(subDays(new Date(), 24), 'MMM d'), revenue: 380 },
        { date: format(subDays(new Date(), 21), 'MMM d'), revenue: 450 },
        { date: format(subDays(new Date(), 18), 'MMM d'), revenue: 520 },
        { date: format(subDays(new Date(), 15), 'MMM d'), revenue: 480 },
        { date: format(subDays(new Date(), 12), 'MMM d'), revenue: 550 },
        { date: format(subDays(new Date(), 9), 'MMM d'), revenue: 490 },
        { date: format(subDays(new Date(), 6), 'MMM d'), revenue: 580 },
        { date: format(subDays(new Date(), 3), 'MMM d'), revenue: 620 },
        { date: format(new Date(), 'MMM d'), revenue: 580 }
      ]
    },
    recentActivities: [
      {
        id: "1",
        type: "game_submission",
        details: "New game 'Space Odyssey' submitted for review",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        user: { id: "u1", username: "GameDev1" }
      },
      {
        id: "2",
        type: "game_approval",
        details: "Game 'Puzzle Master' approved for publishing",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        user: { id: "u2", username: "AdminUser" }
      },
      {
        id: "3",
        type: "user_registration",
        details: "New game developer registered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        user: { id: "u3", username: "NewDeveloper23" }
      },
      {
        id: "4",
        type: "game_play",
        details: "Game 'Racing Champions' reached 5,000 plays",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        id: "5",
        type: "game_rejection",
        details: "Game 'Battle Arena' rejected due to policy violations",
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        user: { id: "u2", username: "AdminUser" }
      }
    ]
  };

  // Use real data when available, otherwise use mock data for demo
  const stats = dashboardStats?.stats || mockData.stats;
  const charts = dashboardStats?.charts || mockData.charts;
  const recentActivities = dashboardStats?.recentActivities || mockData.recentActivities;

  return (
    <DashboardLayout activeTab="admin-overview">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          
          <Tabs
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as any)}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Games"
            value={stats.totalGames}
            icon={<Gamepad className="h-5 w-5 text-primary" />}
            trend={stats.trends.gamesGrowth}
            trendLabel="vs. previous period"
            link="/dashboard/admin/games"
            linkLabel="View all games"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5 text-primary" />}
            trend={stats.trends.usersGrowth}
            trendLabel="vs. previous period"
            link="/dashboard/admin/users"
            linkLabel="View all users"
          />
          <StatsCard
            title="Total Plays"
            value={stats.totalGamePlays.toLocaleString()}
            icon={<Activity className="h-5 w-5 text-primary" />}
            trend={stats.trends.playsGrowth}
            trendLabel="vs. previous period"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            trend={stats.trends.revenueGrowth}
            trendLabel="vs. previous period"
          />
        </div>

        {/* Secondary stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Pending Reviews"
            value={stats.pendingSubmissions}
            icon={<Layers className="h-5 w-5 text-primary" />}
            description="Game submissions awaiting review"
            link="/dashboard/admin/game-reviews"
            linkLabel="Review submissions"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon={<User className="h-5 w-5 text-primary" />}
            description="Users active in the last 24 hours"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            description="Players making purchases"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.userGrowth}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Platform revenue over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={charts.revenue}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Plays</CardTitle>
              <CardDescription>Daily game plays</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.gamePlays}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Games</CardTitle>
              <CardDescription>Most popular games by plays and revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.topGames}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plays" fill="#8884d8" name="Plays" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Categories</CardTitle>
              <CardDescription>Distribution of games by category</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} games`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Distribution of users by role</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.userRoles}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {charts.userRoles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>Status of all game submissions</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.submissionStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {charts.submissionStatus.map((entry) => (
                      <Cell 
                        key={`cell-${entry.status}`} 
                        fill={SUBMISSION_STATUS_COLORS[entry.status]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} games`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <RecentActivityCard activities={recentActivities} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardOverview;