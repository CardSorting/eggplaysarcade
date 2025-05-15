import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Game } from "@/lib/types";
import { 
  Bookmark, 
  Star, 
  Clock, 
  Trophy, 
  Heart,
  ThumbsUp,
  PlayIcon,
  User
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function PlayerDashboard() {
  const { user } = useAuth();
  
  // Mock data - would be replaced with real queries
  const recentlyPlayed = [
    {
      id: 1,
      title: "Space Adventure",
      thumbnailUrl: "/images/game1.jpg",
      lastPlayed: "2 hours ago",
      timePlayed: "4h 23m"
    },
    {
      id: 2,
      title: "Puzzle Master",
      thumbnailUrl: "/images/game2.jpg",
      lastPlayed: "Yesterday",
      timePlayed: "1h 45m" 
    },
    {
      id: 3,
      title: "Racing Legends",
      thumbnailUrl: "/images/game3.jpg",
      lastPlayed: "3 days ago",
      timePlayed: "6h 12m"
    }
  ];
  
  const favoriteGames = [
    {
      id: 4,
      title: "Fantasy Quest",
      thumbnailUrl: "/images/game4.jpg",
      rating: 5
    },
    {
      id: 5,
      title: "Zombie Survival",
      thumbnailUrl: "/images/game5.jpg",
      rating: 4
    }
  ];
  
  const achievements = [
    {
      id: 1,
      name: "First Victory",
      description: "Win your first game",
      icon: "🏆",
      unlocked: true,
      game: "Space Adventure"
    },
    {
      id: 2,
      name: "Speed Demon",
      description: "Complete a race in under 2 minutes",
      icon: "🏎️",
      unlocked: true,
      game: "Racing Legends"
    },
    {
      id: 3,
      name: "Puzzle Master",
      description: "Solve 10 puzzles in a row without hints",
      icon: "🧩",
      unlocked: false,
      progress: 70,
      game: "Puzzle Master"
    }
  ];
  
  return (
    <DashboardLayout activeTab="dashboard">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Player Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/games">
                <PlayIcon className="mr-2 h-4 w-4" />
                Play Games
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatarUrl || ""} alt={user?.username || "User"} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-bold">{user?.username}</h3>
            <p className="text-muted-foreground">{user?.bio || "No bio provided"}</p>
          </div>
        </div>
        
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Played Games</CardTitle>
                <CardDescription>
                  Continue where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentlyPlayed.map(game => (
                    <Card key={game.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{game.title}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {game.lastPlayed}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-xs text-muted-foreground">
                          Total play time: {game.timePlayed}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" asChild className="w-full">
                          <Link href={`/games/${game.id}`}>
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Play Now
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>
                  Your recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4 border-l-2 border-primary pl-4 pt-2 pb-6">
                  <div className="flex-1">
                    <p className="font-medium">Played "Space Adventure"</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 border-l-2 border-muted pl-4 pt-2 pb-6">
                  <div className="flex-1">
                    <p className="font-medium">Rated "Puzzle Master" with 4 stars</p>
                    <p className="text-sm text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 border-l-2 border-muted pl-4 pt-2 pb-6">
                  <div className="flex-1">
                    <p className="font-medium">Added "Fantasy Quest" to favorites</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Games</CardTitle>
                <CardDescription>
                  Your saved favorite games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {favoriteGames.map(game => (
                    <Card key={game.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{game.title}</CardTitle>
                          <Badge variant="outline">
                            {game.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/games/${game.id}`}>
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Play
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Heart className="h-4 w-4 fill-current text-destructive" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                    <Button variant="outline" asChild>
                      <Link href="/games">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Find Games to Favorite
                      </Link>
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Achievements</CardTitle>
                <CardDescription>
                  Track your progress and completed achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 border rounded-lg ${achievement.unlocked ? "" : "opacity-70"}`}
                    >
                      <div className="flex items-start">
                        <div className="text-2xl mr-3">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">
                              {achievement.name}
                            </h3>
                            {achievement.unlocked && (
                              <Badge className="ml-2 bg-green-500">Unlocked</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Game: {achievement.game}
                          </p>
                          
                          {!achievement.unlocked && 'progress' in achievement && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Settings</CardTitle>
                <CardDescription>
                  Manage your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Information</h3>
                  <p><strong>Username:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email || "No email provided"}</p>
                  <p><strong>Member Since:</strong> April 2024</p>
                </div>
                
                <div className="flex pt-4">
                  <Button>
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}