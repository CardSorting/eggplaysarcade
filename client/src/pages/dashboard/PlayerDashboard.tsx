import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gamepad2, 
  Heart,
  Star,
  Clock,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { getQueryFn } from "@/lib/queryClient";
import { Redirect, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Game } from "@/lib/types";

export default function PlayerDashboard() {
  const { user } = useAuth();
  
  // Redirect if not a player
  if (user && user.role !== UserRole.PLAYER) {
    return <Redirect to="/dashboard" />;
  }
  
  // Player's games queries
  const { data: recentGames, isLoading: isLoadingRecent } = useQuery<Game[]>({
    queryKey: ["/api/player/recent-games"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: favoriteGames, isLoading: isLoadingFavorites } = useQuery<Game[]>({
    queryKey: ["/api/player/favorites"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const isLoading = isLoadingRecent || isLoadingFavorites;
  
  const renderGameGrid = (games: Game[] | undefined) => {
    if (!games || games.length === 0) {
      return (
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>No games yet</CardTitle>
            <CardDescription>
              You haven't played any games yet. Explore our collection to find games you'll enjoy!
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/games">
                <Gamepad2 className="mr-2 h-4 w-4" /> Browse Games
              </Link>
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden">
            <img 
              src={game.thumbnailUrl} 
              alt={game.title}
              className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{game.title}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {game.categoryId === 1 ? 'Action' : 
                   game.categoryId === 2 ? 'Puzzle' : 
                   game.categoryId === 3 ? 'Strategy' : 
                   game.categoryId === 4 ? 'Casual' : 'Other'}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 mt-1">
                {game.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>{game.players || 0}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4" />
                  <span>{game.rating ? (game.rating / 10).toFixed(1) : 'No ratings'}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="default" size="sm" asChild>
                <Link href={`/play/${game.id}`}>
                  <Gamepad2 className="mr-2 h-4 w-4" /> Play
                </Link>
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout activeTab="my games">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">My Games</h2>
        <p className="text-muted-foreground">
          View your recent and favorite games.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="recent" className="mt-6">
            <TabsList>
              <TabsTrigger value="recent">
                <Clock className="h-4 w-4 mr-2" />
                Recently Played
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-4">
              {renderGameGrid(recentGames)}
            </TabsContent>
            <TabsContent value="favorites" className="mt-4">
              {renderGameGrid(favoriteGames)}
            </TabsContent>
          </Tabs>
        )}
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Games</CardTitle>
              <CardDescription>
                Based on your play history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <Gamepad2 className="mx-auto h-12 w-12 mb-4" />
                <p>Play more games to get personalized recommendations</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/games">Browse All Games</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}