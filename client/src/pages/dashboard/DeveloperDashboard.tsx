import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/lib/types";
import { 
  Loader2, 
  Plus, 
  BarChart3, 
  GamepadIcon, 
  Star, 
  Eye, 
  Pencil,
  Trash
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface DeveloperGame extends Game {
  publishedAt: Date;
  players: number;
  rating: number;
}

export default function DeveloperDashboard() {
  const { user } = useAuth();
  
  // Fetch games created by the current developer
  const { data: myGames = [], isLoading } = useQuery<DeveloperGame[]>({
    queryKey: ['/api/games/developer', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/games?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch developer games');
      }
      const games = await response.json();
      return games.map((game: Game) => ({
        ...game,
        publishedAt: new Date(game.publishedAt || new Date()),
        // Ensure players and rating are not null for calculations
        players: game.players || 0,
        rating: game.rating || 0
      }));
    },
    enabled: !!user?.id
  });
  
  return (
    <DashboardLayout activeTab="dashboard">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Developer Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/dashboard/submit">
                <Plus className="mr-2 h-4 w-4" />
                Submit New Game
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="mygames" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mygames">My Games</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mygames" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Games
                      </CardTitle>
                      <GamepadIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myGames.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Players
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {myGames.reduce((sum: number, game: any) => sum + game.players, 0).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Rating
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {myGames.length > 0 
                          ? (myGames.reduce((sum: number, game: any) => sum + game.rating, 0) / myGames.length).toFixed(1)
                          : "N/A"
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>My Published Games</CardTitle>
                    <CardDescription>
                      Manage and monitor all your games in one place
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myGames.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <GamepadIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No games published yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          Get started by publishing your first game
                        </p>
                        <Button asChild>
                          <Link href="/dashboard/submit">
                            <Plus className="mr-2 h-4 w-4" />
                            Submit Game
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myGames.map((game: DeveloperGame) => (
                          <div key={game.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1 space-y-1 mb-4 md:mb-0">
                              <div className="flex items-center">
                                <h3 className="font-medium text-lg">{game.title}</h3>
                                {game.rating && (
                                  <Badge variant="outline" className="ml-2">
                                    {game.rating} ★
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{game.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Published: {game.publishedAt.toLocaleDateString()} • {(game.players || 0).toLocaleString()} players
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/games/${game.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/games/${game.id}/edit`}>
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
                <CardDescription>
                  View detailed analytics for all your games
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mt-4">Detailed analytics will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Developer Profile</CardTitle>
                <CardDescription>
                  Manage your developer profile and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Information</h3>
                    <p><strong>Username:</strong> {user?.username}</p>
                    <p><strong>Email:</strong> {user?.email || "No email provided"}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <p><strong>Bio:</strong> {user?.bio || "No bio provided"}</p>
                  </div>
                  
                  <div className="flex pt-4">
                    <Button>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}