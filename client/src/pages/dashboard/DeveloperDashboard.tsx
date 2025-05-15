import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GameController, 
  Plus,
  BarChart3,
  Users,
  Star,
  Pencil,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { getQueryFn } from "@/lib/queryClient";
import { Redirect, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Game } from "@/lib/types";

export default function DeveloperDashboard() {
  const { user } = useAuth();
  
  // Redirect if not a developer
  if (user && user.role !== UserRole.GAME_DEVELOPER) {
    return <Redirect to="/dashboard" />;
  }
  
  // Developer's games query
  const { data: myGames, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/developer"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <DashboardLayout activeTab="my games">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">My Games</h2>
          <Button asChild>
            <Link href="/dashboard/submit">
              <Plus className="mr-2 h-4 w-4" /> Submit New Game
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Manage your submitted HTML5 games and track their performance.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {(!myGames || myGames.length === 0) ? (
              <Card className="bg-muted/40">
                <CardHeader>
                  <CardTitle>No games yet</CardTitle>
                  <CardDescription>
                    You haven't submitted any games yet. Start by creating your first game!
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild>
                    <Link href="/dashboard/submit">
                      <GameController className="mr-2 h-4 w-4" /> Submit Your First Game
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myGames.map((game) => (
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
                        <div className="flex items-center">
                          <BarChart3 className="mr-1 h-4 w-4" />
                          <span>Stats</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/play/${game.id}`}>
                          <GameController className="mr-2 h-4 w-4" /> Play
                        </Link>
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/edit/${game.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            <div className="grid gap-4 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    How your games are performing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-muted-foreground">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                    <p>Analytics data will be available once your games receive more traffic</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}