import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Gamepad,
  Share2,
  Star,
  MessageSquare,
  Play,
  Heart,
  User,
  Info,
  Calendar
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GameDetail = () => {
  const params = useParams<{ id: string }>();
  const gameId = params.id;
  
  // Fetch game details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/games/${gameId}`],
    queryFn: getQueryFn()
  });
  
  // Play game mutation
  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/games/${gameId}/play`);
      return res.json();
    },
    onSuccess: (data) => {
      // Redirect to the sandbox URL
      window.open(data.sandboxUrl, '_blank', 'noopener,noreferrer');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to launch game",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Like game mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/games/${gameId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({
        title: "Game liked",
        description: "You've added this game to your favorites",
      });
    }
  });
  
  // Handle play button click
  const handlePlayGame = () => {
    playMutation.mutate();
  };
  
  // Handle like button click
  const handleLikeGame = () => {
    likeMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
        <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }
  
  const game = data.game;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Game Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0">
              <img 
                src={game.thumbnailUrl || "https://via.placeholder.com/128"}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{game.title}</h1>
              <p className="text-lg mt-2">{game.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">
                  Category: {game.categoryName || "Game"}
                </Badge>
                
                {game.tags && game.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              
              <div className="flex items-center mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{game.rating || 0}</span>
                </div>
                <span className="mx-2">•</span>
                <div className="flex items-center gap-1">
                  <Gamepad className="h-5 w-5" />
                  <span>{game.players || 0} plays</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 md:justify-center">
              <Button 
                onClick={handlePlayGame}
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                size="lg"
                disabled={playMutation.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Play Game
              </Button>
              
              <Button 
                onClick={handleLikeGame} 
                variant="outline" 
                disabled={likeMutation.isPending}
              >
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
              
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{game.description}</p>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-bold mb-4">How to Play</h3>
                <p>{game.instructions}</p>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                  <p className="text-muted-foreground">Be the first to review this game!</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Game Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Developer</h3>
                  <p>{game.developerName || "Anonymous"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Released</h3>
                  <p>{game.publishedAt ? new Date(game.publishedAt).toLocaleDateString() : "Unknown"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p>{game.categoryName || "Game"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Plays</h3>
                  <p>{game.players || 0}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{game.rating || 0}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Similar Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No similar games found</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GameDetail;