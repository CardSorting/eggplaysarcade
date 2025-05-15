import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useB2Image, useB2Game } from "@/hooks/use-b2-file";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const GameDetail = () => {
  const params = useParams<{ id: string }>();
  const gameId = parseInt(params.id);
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  
  // Define types for API responses
  interface GameResponse {
    game: {
      id: number;
      title: string;
      description: string;
      categoryName?: string;
      thumbnailUrl?: string;
      gameUrl?: string;
      rating?: number;
      players?: number;
      tags?: string[];
      instructions?: string;
      developerName?: string;
      publishedAt?: string;
    };
  }
  
  interface ReviewsResponse {
    reviews: Array<{
      id: number;
      rating: number;
      content?: string;
      createdAt: string;
      user?: {
        username: string;
      };
    }>;
  }
  
  interface WishlistResponse {
    inWishlist: boolean;
  }

  // Fetch game details
  const { data, isLoading, error } = useQuery<GameResponse>({
    queryKey: [`/api/games/${gameId}`],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Fetch game reviews
  const { data: reviewsData } = useQuery<ReviewsResponse>({
    queryKey: [`/api/games/${gameId}/reviews`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!gameId
  });
  
  // Check wishlist status if user is logged in
  const { data: wishlistStatus, refetch: refetchWishlistStatus } = useQuery<WishlistResponse>({
    queryKey: [`/api/wishlist/check/${gameId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user
  });
  
  // Update wishlist state when status changes
  useEffect(() => {
    if (wishlistStatus?.inWishlist !== undefined) {
      setInWishlist(wishlistStatus.inWishlist);
    }
  }, [wishlistStatus]);
  
  // Play game mutation
  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/games/${gameId}/play`);
      return res.json();
    },
    onSuccess: () => {
      // Open the game in a new tab using the B2 presigned URL
      if (gameUrl) {
        window.open(gameUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast({
          title: "Game loading",
          description: "Please wait while we prepare the game file",
          variant: "default",
        });
      }
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
  
  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wishlist', { gameId });
      return await response.json();
    },
    onSuccess: () => {
      setInWishlist(true);
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Added to wishlist",
        description: "Game has been added to your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add game to wishlist",
        variant: "destructive",
      });
    },
  });
  
  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/wishlist/${gameId}`);
      return await response.json();
    },
    onSuccess: () => {
      setInWishlist(false);
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Removed from wishlist",
        description: "Game has been removed from your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to remove game from wishlist",
        variant: "destructive",
      });
    },
  });
  
  // Handle play button click
  const handlePlayGame = () => {
    playMutation.mutate();
  };
  
  // Handle like button click
  const handleLikeGame = () => {
    likeMutation.mutate();
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add games to your wishlist",
        variant: "default",
      });
      return;
    }
    
    if (inWishlist) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
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
  
  const game = data?.game;
  
  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Use B2 hooks for file access - always call hooks unconditionally
  const thumbnailUrl = game.thumbnailUrl || null;
  const gameFileUrl = game.gameUrl || null;
  
  const imageProps = useB2Image(thumbnailUrl);
  const { gameUrl, isLoading: gameUrlLoading } = useB2Game(gameFileUrl);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Game Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0">
              {imageProps.src ? (
                <img 
                  {...imageProps}
                  alt={game.title}
                  className={`w-full h-full object-cover ${imageProps.className}`}
                />
              ) : (
                <Skeleton className="w-full h-full" />
              )}
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
              
              <Button 
                onClick={handleWishlistToggle}
                variant="outline"
                disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                className={inWishlist ? "bg-muted" : ""}
              >
                <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-primary text-primary" : ""}`} />
                {inWishlist ? "Wishlisted" : "Add to Wishlist"}
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
                {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span className="font-medium">{review.user?.username || "Anonymous"}</span>
                          </div>
                          <div className="ml-auto flex items-center">
                            <div className="flex">
                              {Array(5).fill(0).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        {review.content && (
                          <p className="mt-2">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                    <p className="text-muted-foreground">Be the first to review this game!</p>
                  </div>
                )}
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