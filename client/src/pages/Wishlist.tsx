import { Helmet } from 'react-helmet';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Game } from "@shared/schema";
import { Heart, Loader2, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GameCard from "@/components/GameCard";
import { useToast } from "@/hooks/use-toast";

const Wishlist = () => {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch wishlist items
  const { data, isLoading, error, refetch } = useQuery<{ games: Game[] }>({
    queryKey: ["/api/wishlist"],
    enabled: !!user, // Only run query if user is logged in
  });

  // Remove game from wishlist
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (gameId: number) => {
      await apiRequest("DELETE", `/api/wishlist/${gameId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Game removed",
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

  const handleRemoveFromWishlist = (gameId: number) => {
    removeFromWishlistMutation.mutate(gameId);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Helmet>
        <title>Your Wishlist - GameVault</title>
        <meta name="description" content="View and manage your saved games on GameVault." />
      </Helmet>

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
            <p className="text-muted-foreground mt-1">Games you've saved to play later</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/games')}
            className="hidden sm:flex"
          >
            Browse More Games
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load your wishlist. Please try again later.
            </AlertDescription>
          </Alert>
        ) : data?.games && data.games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.games.map((game) => (
              <div key={game.id} className="relative group">
                <GameCard game={game} />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveFromWishlist(game.id)}
                  title="Remove from wishlist"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-xl">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't added any games to your wishlist yet. Browse our collection and save games you'd like to play later!
            </p>
            <Button onClick={() => navigate('/games')}>
              Browse Games
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;