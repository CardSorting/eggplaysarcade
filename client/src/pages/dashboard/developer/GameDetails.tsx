import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit,
  ExternalLink,
  Eye,
  BarChart2,
  Users,
  Calendar,
  Star,
  DollarSign,
  Clock,
  Activity,
  BarChart,
  LineChart,
  PieChart,
  Map,
  FileCode,
  MessageSquare,
  Upload,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { SubmissionStatus, TimeFrame } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
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

// Helper to format time duration
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Timeframe selector component
const TimeframeSelector = ({ 
  value, 
  onChange 
}: { 
  value: TimeFrame; 
  onChange: (value: TimeFrame) => void 
}) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TimeFrame)} className="w-full">
      <TabsList className="grid grid-cols-5">
        <TabsTrigger value="last7days">7 Days</TabsTrigger>
        <TabsTrigger value="last30days">30 Days</TabsTrigger>
        <TabsTrigger value="thisMonth">This Month</TabsTrigger>
        <TabsTrigger value="lastMonth">Last Month</TabsTrigger>
        <TabsTrigger value="thisYear">This Year</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  suffix
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend: number;
  suffix?: string;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
              {value}{suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
            </h3>
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

// Game overview tab
const GameOverviewTab = ({ game }: { game: any }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img 
                  src={game?.thumbnailUrl || "https://via.placeholder.com/128"} 
                  alt={game?.title} 
                  className="w-32 h-32 rounded-md object-cover"
                />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{game?.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {game?.categories?.map((category: string) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground">{game?.shortDescription}</p>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{game?.totalPlayers?.toLocaleString() || 0} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{game?.rating || 0} rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Published {game?.publishedAt ? format(new Date(game.publishedAt), 'MMM d, yyyy') : 'Not published'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Game Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {game?.description || "No description provided."}
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Features</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {game?.features?.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  )) || (
                    <p>No features listed.</p>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {game?.versions?.map((version: any) => (
                  <div key={version.versionNumber} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">v{version.versionNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(version.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {version.status === "published" ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="outline">{version.status}</Badge>
                      )}
                    </div>
                    <p className="text-sm mt-2">{version.releaseNotes}</p>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No version history available.</p>
                )}
                
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href={`/dashboard/developer/games/${game?.id}/update`}>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit New Version
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Review Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {game?.reviewNotes?.length > 0 ? (
                  game.reviewNotes.map((note: any) => (
                    <div key={note.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start gap-2">
                        <div className={`p-1 rounded-full mt-0.5 ${
                          note.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          note.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{
                            note.severity === 'critical' ? 'Critical Issue' :
                            note.severity === 'warning' ? 'Warning' :
                            'Information'
                          }</p>
                          <p className="text-sm mt-1">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No review notes.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Analytics tab
const AnalyticsTab = ({ gameId, analytics }: { gameId: string, analytics: any }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("last30days");
  
  // Query for analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: [`/api/developer/games/${gameId}/analytics`, timeframe],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Use real data when available, otherwise use the passed-in data
  const data = analyticsData || analytics;

  // Mock data for the demo
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="space-y-6">
      <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Players"
          value={data?.playerMetrics.totalPlayers.toLocaleString()}
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={data?.playerMetrics.playersTrend}
        />
        <StatsCard
          title="Active Players"
          value={data?.playerMetrics.activePlayers.toLocaleString()}
          icon={<Activity className="h-5 w-5 text-primary" />}
          trend={Math.round((data?.playerMetrics.activePlayers / data?.playerMetrics.totalPlayers) * 100 - 100)}
        />
        <StatsCard
          title="Avg. Session Time"
          value={formatTime(data?.engagementMetrics.averageSessionTime)}
          icon={<Clock className="h-5 w-5 text-primary" />}
          trend={data?.engagementMetrics.sessionTimeTrend}
          suffix="min"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(data?.revenueMetrics.totalRevenue)}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={data?.revenueMetrics.revenueTrend}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Activity</CardTitle>
            <CardDescription>Daily active players over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.timeseriesData.dates.map((date: string, i: number) => ({
                  date,
                  players: data.timeseriesData.players[i],
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="players"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorPlayers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.timeseriesData.dates.map((date: string, i: number) => ({
                  date,
                  revenue: data.timeseriesData.revenue[i],
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Duration</CardTitle>
            <CardDescription>Average session time in minutes</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.timeseriesData.dates.map((date: string, i: number) => ({
                  date,
                  time: Math.round(data.timeseriesData.averageSessionTime[i] / 60),
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="time"
                  stroke="#ffc658"
                  fillOpacity={1}
                  fill="url(#colorTime)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Players by device type</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={Object.entries(data?.platformMetrics.deviceBreakdown || {}).map(([name, value]) => ({
                    name,
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(data?.platformMetrics.deviceBreakdown || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Players by country</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={Object.entries(data?.geographicData.countryDistribution || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([country, value]) => ({
                    country,
                    players: value
                  }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" />
                <RechartsTooltip />
                <Bar dataKey="players" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const GameDetailsPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query for game details
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: [`/api/developer/games/${gameId}`],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Mock data for analytics (would be replaced with API data)
  const mockAnalytics = {
    playerMetrics: {
      totalPlayers: 5280,
      newPlayers: 350,
      activePlayers: 1250,
      playersTrend: 12,
      retentionRate: 0.45,
      churnRate: 0.15
    },
    engagementMetrics: {
      totalSessions: 8500,
      averageSessionTime: 540, // in seconds
      averageSessionsPerPlayer: 6.8,
      sessionTimeTrend: 5,
      bounceRate: 0.12,
      completionRate: 0.68
    },
    revenueMetrics: {
      totalRevenue: 1250.75,
      revenuePerPlayer: 0.24,
      adRevenue: 450.25,
      inAppPurchaseRevenue: 800.5,
      premiumRevenue: 0,
      subscriptionRevenue: 0,
      revenueTrend: 8
    },
    platformMetrics: {
      deviceBreakdown: {
        Mobile: 62,
        Desktop: 32,
        Tablet: 6
      },
      browserBreakdown: {
        Chrome: 58,
        Safari: 25,
        Firefox: 12,
        Edge: 5
      },
      osBreakdown: {
        Android: 35,
        iOS: 28,
        Windows: 25,
        macOS: 8,
        Linux: 4
      }
    },
    timeseriesData: {
      dates: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5", "Jan 6", "Jan 7"],
      players: [520, 580, 600, 650, 700, 750, 800],
      sessions: [1200, 1300, 1250, 1400, 1500, 1550, 1600],
      revenue: [150, 165, 180, 195, 210, 225, 240],
      averageSessionTime: [520, 530, 545, 550, 560, 570, 580]
    },
    geographicData: {
      countryDistribution: {
        "United States": 45,
        "Canada": 12,
        "United Kingdom": 10,
        "Germany": 8,
        "France": 6,
        "Australia": 5,
        "Japan": 4,
        "Brazil": 3,
        "India": 2,
        "Others": 5
      }
    }
  };
  
  // Loading state
  if (isLoadingGame) {
    return (
      <DashboardLayout activeTab="dev-games">
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Get status badge
  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case SubmissionStatus.SUBMITTED:
        return <Badge variant="secondary">Pending Review</Badge>;
      case SubmissionStatus.IN_REVIEW:
        return <Badge variant="secondary">In Review</Badge>;
      case SubmissionStatus.APPROVED:
        return <Badge className="bg-green-500">Approved</Badge>;
      case SubmissionStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case SubmissionStatus.PUBLISHED:
        return <Badge>Published</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout activeTab="dev-games">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/developer/games">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{game?.title || "Game Details"}</h1>
              <div className="flex items-center gap-2 mt-1">
                {game?.status && getStatusBadge(game.status)}
                {game?.currentVersion && (
                  <p className="text-sm text-muted-foreground">v{game.currentVersion}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/developer/games/${gameId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Game
              </Link>
            </Button>
            {game?.status === SubmissionStatus.PUBLISHED && (
              <Button asChild>
                <Link href={`/games/${gameId}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live Page
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="code">
              <FileCode className="h-4 w-4 mr-2" />
              Code & Assets
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <Upload className="h-4 w-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              User Feedback
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="overview">
              <GameOverviewTab game={game} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsTab gameId={gameId} analytics={mockAnalytics} />
            </TabsContent>
            
            <TabsContent value="code">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Code & Assets</h3>
                  <p className="text-muted-foreground mt-2">
                    View and manage your game's source code and assets.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="submissions">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Submission History</h3>
                  <p className="text-muted-foreground mt-2">
                    View your submission history and update requests.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="feedback">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">User Feedback</h3>
                  <p className="text-muted-foreground mt-2">
                    View and respond to feedback from users.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GameDetailsPage;