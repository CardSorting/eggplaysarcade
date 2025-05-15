import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2, Users, DollarSign, BarChart, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatus, TimeFrame } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
};

const StatsCard = ({
  title,
  value,
  icon,
  trend
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <span className={`text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
};

const LatestSubmissionsTable = ({ submissions }: { submissions: any[] }) => {
  return (
    <div className="space-y-4">
      {submissions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No submissions yet</p>
      ) : (
        submissions.map((submission) => (
          <div key={submission.id} className="flex justify-between items-center border-b pb-3">
            <div>
              <h4 className="font-medium">{submission.gameTitle}</h4>
              <p className="text-sm text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
              </p>
            </div>
            <div>
              {submission.status === SubmissionStatus.SUBMITTED && (
                <Badge variant="outline">Pending Review</Badge>
              )}
              {submission.status === SubmissionStatus.IN_REVIEW && (
                <Badge variant="secondary">In Review</Badge>
              )}
              {submission.status === SubmissionStatus.APPROVED && (
                <Badge className="bg-green-500">Approved</Badge>
              )}
              {submission.status === SubmissionStatus.REJECTED && (
                <Badge variant="destructive">Rejected</Badge>
              )}
              {submission.status === SubmissionStatus.PUBLISHED && (
                <Badge variant="default">Published</Badge>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const PerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="players"
          name="Players"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorPlayers)"
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const TopGamesChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 100,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Legend />
        <Bar dataKey="players" name="Total Players" fill="#8884d8" />
        <Bar dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const DeveloperDashboardOverview = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("last30days");
  
  const { data: gamesSummary, isLoading } = useQuery({
    queryKey: ['/api/developer/dashboard/summary', timeframe],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Mock data for preview
  const mockSummary = {
    totalGames: 5,
    totalPlayers: 12450,
    totalRevenue: 3245.5,
    conversionRate: 2.6,
    gamesGrowth: 20,
    playersGrowth: 35,
    revenueGrowth: 15,
    conversionGrowth: -2,
    performanceData: [
      { date: "Jan 1", players: 500, revenue: 120 },
      { date: "Jan 2", players: 520, revenue: 125 },
      { date: "Jan 3", players: 510, revenue: 130 },
      { date: "Jan 4", players: 550, revenue: 135 },
      { date: "Jan 5", players: 600, revenue: 140 },
      { date: "Jan 6", players: 650, revenue: 145 },
      { date: "Jan 7", players: 700, revenue: 150 },
    ],
    topGames: [
      { name: "Block Puzzle", players: 5000, revenue: 1200 },
      { name: "Space Shooter", players: 3500, revenue: 900 },
      { name: "Chess Master", players: 2200, revenue: 500 },
      { name: "Tetris Clone", players: 1800, revenue: 450 },
      { name: "Car Racing Sim", players: 900, revenue: 200 },
    ],
    latestSubmissions: [
      {
        id: "1",
        gameTitle: "New Racing Game",
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: SubmissionStatus.IN_REVIEW
      },
      {
        id: "2",
        gameTitle: "Puzzle Adventure",
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: SubmissionStatus.APPROVED
      },
      {
        id: "3",
        gameTitle: "Zombie Survival",
        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        status: SubmissionStatus.PUBLISHED
      }
    ],
    recentActivity: [
      {
        id: "1",
        action: "Game Published",
        game: "Puzzle Adventure",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: "2",
        action: "New Review",
        game: "Space Shooter",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: "3",
        action: "Revenue Milestone",
        game: "Block Puzzle",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]
  };

  // Use the real data when available, otherwise use mock data for preview
  const summaryData = gamesSummary || mockSummary;

  return (
    <DashboardLayout activeTab="dev-overview">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Developer Dashboard</h1>
          <Tabs
            defaultValue="last30days"
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as TimeFrame)}
            className="w-[400px]"
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="last7days">7 Days</TabsTrigger>
              <TabsTrigger value="last30days">30 Days</TabsTrigger>
              <TabsTrigger value="thisMonth">This Month</TabsTrigger>
              <TabsTrigger value="thisYear">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Games"
            value={summaryData.totalGames}
            icon={<Gamepad2 className="h-5 w-5 text-primary" />}
            trend={summaryData.gamesGrowth}
          />
          <StatsCard
            title="Total Players"
            value={summaryData.totalPlayers.toLocaleString()}
            icon={<Users className="h-5 w-5 text-primary" />}
            trend={summaryData.playersGrowth}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(summaryData.totalRevenue)}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            trend={summaryData.revenueGrowth}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${summaryData.conversionRate}%`}
            icon={<BarChart className="h-5 w-5 text-primary" />}
            trend={summaryData.conversionGrowth}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Player and revenue metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={summaryData.performanceData} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Latest Submissions</CardTitle>
              <CardDescription>Status of your recent game submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <LatestSubmissionsTable submissions={summaryData.latestSubmissions} />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Games</CardTitle>
              <CardDescription>Your best games by players and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <TopGamesChart data={summaryData.topGames} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events from your games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 border-b pb-3">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.game}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboardOverview;