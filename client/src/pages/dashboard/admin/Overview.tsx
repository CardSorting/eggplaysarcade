import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Helmet } from "react-helmet";
import { 
  ChevronUp, 
  ChevronDown, 
  Minus, 
  Users, 
  Gamepad as GameController, 
  ScrollText, 
  FolderIcon 
} from "lucide-react";
import { SubmissionStatus } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

// Define colors for submission status
const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  "draft": "#94a3b8",
  "submitted": "#3b82f6",
  "in_review": "#f59e0b",
  "approved": "#22c55e", 
  "rejected": "#ef4444",
  "published": "#8b5cf6"
};

// Define colors for categories
const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#ec4899", // Pink
];

const RecentActivityCard = ({ activities }: { activities: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, i) => (
            <div key={i} className="flex gap-4">
              <div className={`rounded-full p-2 w-10 h-10 flex items-center justify-center ${
                activity.type === 'new_user' ? 'bg-blue-100' :
                activity.type === 'new_game' ? 'bg-purple-100' :
                activity.type === 'submission' ? 'bg-amber-100' :
                'bg-slate-100'
              }`}>
                {activity.type === 'new_user' && <Users className="h-5 w-5 text-blue-600" />}
                {activity.type === 'new_game' && <GameController className="h-5 w-5 text-purple-600" />}
                {activity.type === 'submission' && <ScrollText className="h-5 w-5 text-amber-600" />}
                {activity.type === 'category' && <FolderIcon className="h-5 w-5 text-slate-600" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No recent activities found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Format numbers with K/M suffix
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const StatsCard = ({ title, value, change, icon }: { 
  title: string; 
  value: string | number; 
  change?: number; 
  icon: React.ReactNode;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {typeof change !== 'undefined' && (
          <p className="text-xs flex items-center">
            {change > 0 ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{change}%</span>
              </>
            ) : change < 0 ? (
              <>
                <ChevronDown className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(change)}%</span>
              </>
            ) : (
              <>
                <Minus className="mr-1 h-4 w-4 text-amber-500" />
                <span className="text-amber-500">No change</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">from last period</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboardOverview = () => {
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "90days">("30days");
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard', timeframe],
  });

  // Mock data for development - will be replaced with real data from API
  const mockData = {
    stats: {
      totalUsers: 1254,
      totalUsersChange: 12.5,
      totalGames: 342,
      totalGamesChange: 8.3,
      totalCategories: 18,
      totalCategoriesChange: 0,
      activeUsers: 587,
      activeUsersChange: 15.2,
      submissionsPending: 23,
      submissionsInReview: 8,
      totalGamePlays: 15682,
      totalGamePlaysChange: 23.7
    },
    charts: {
      userGrowth: [
        { date: '2023-01', users: 850 },
        { date: '2023-02', users: 900 },
        { date: '2023-03', users: 950 },
        { date: '2023-04', users: 1000 },
        { date: '2023-05', users: 1050 },
        { date: '2023-06', users: 1100 },
        { date: '2023-07', users: 1150 },
        { date: '2023-08', users: 1200 },
        { date: '2023-09', users: 1254 }
      ],
      gamePlays: [
        { name: 'Adventure', plays: 4320 },
        { name: 'Action', plays: 3280 },
        { name: 'Puzzle', plays: 2890 },
        { name: 'Strategy', plays: 2450 },
        { name: 'RPG', plays: 1680 },
        { name: 'Sports', plays: 1062 }
      ],
      submissionStatus: [
        { name: 'Pending Review', value: 23, status: SubmissionStatus.SUBMITTED },
        { name: 'In Review', value: 8, status: SubmissionStatus.IN_REVIEW },
        { name: 'Approved', value: 12, status: SubmissionStatus.APPROVED },
        { name: 'Rejected', value: 5, status: SubmissionStatus.REJECTED },
        { name: 'Published', value: 294, status: SubmissionStatus.PUBLISHED }
      ]
    },
    recentActivities: [
      {
        type: 'new_game',
        title: 'New Game Published',
        description: 'Space Explorer by GameDev42 is now available',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: 'submission',
        title: 'Game Submission Approved',
        description: 'Fantasy Quest by GameDev18 has been approved',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        type: 'new_user',
        title: 'New Developer Joined',
        description: 'GameDev52 registered as a game developer',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        type: 'category',
        title: 'New Category Added',
        description: 'Educational Games category has been added',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]
  };

  // Use real data when available, otherwise use mock data for demo
  const stats = dashboardStats?.stats || mockData.stats;
  const charts = dashboardStats?.charts || mockData.charts;
  const recentActivities = dashboardStats?.recentActivities || mockData.recentActivities;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Site Overview</title>
      </Helmet>
      
      <DashboardLayout activeTab="admin-overview">
        <div className="flex flex-col gap-6 p-6">
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

          {/* Key stats cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Users" 
              value={formatNumber(stats.totalUsers)}
              change={stats.totalUsersChange}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard 
              title="Total Games" 
              value={formatNumber(stats.totalGames)}
              change={stats.totalGamesChange}
              icon={<GameController className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard 
              title="Active Users" 
              value={formatNumber(stats.activeUsers)}
              change={stats.activeUsersChange}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard 
              title="Game Plays" 
              value={formatNumber(stats.totalGamePlays)}
              change={stats.totalGamePlaysChange}
              icon={<GameController className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Submissions overview */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>User count over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submissions Status</CardTitle>
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

          {/* Game plays by category */}
          <Card>
            <CardHeader>
              <CardTitle>Game Plays by Category</CardTitle>
              <CardDescription>Number of game plays per category</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.gamePlays}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${formatNumber(value as number)} plays`, "Plays"]}
                  />
                  <Bar dataKey="plays" fill="#3b82f6">
                    {charts.gamePlays.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <RecentActivityCard activities={recentActivities} />
        </div>
      </DashboardLayout>
    </>
  );
};

export default AdminDashboardOverview;