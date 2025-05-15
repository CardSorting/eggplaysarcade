/**
 * Game detail container component
 * Acts as the coordinator between different game detail components
 * Following Clean Architecture for separation of concerns
 */
import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useB2Game } from "@/hooks/use-b2-file";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Domain layer
import { Game, Review } from "./types";

// Application layer (services/use cases)
import { 
  useGameQuery, 
  useGameReviewsQuery, 
  useWishlistStatusQuery,
  usePlayGameMutation,
  useLikeGameMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation
} from "./services/gameService";

// Presentation layer (components)
import { 
  GameHeader,
  GameAbout,
  GameReviews,
  GameDetailSidebar,
  GameNotFound,
  LoadingSpinner
} from "./components";

/**
 * Main container for the Game Detail view
 * Following Container/Presentational pattern
 */
export function GameDetailContainer() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const gameId = parseInt(params.id);
  const [inWishlist, setInWishlist] = useState(false);
  
  // Application layer: Fetch game data (Query side of CQRS)
  const { 
    data: gameData, 
    isLoading: isGameLoading, 
    error: gameError
  } = useGameQuery(gameId);
  
  const { 
    data: reviewsData, 
    isLoading: areReviewsLoading 
  } = useGameReviewsQuery(gameId);
  
  const { 
    data: wishlistStatus, 
    isLoading: isWishlistStatusLoading 
  } = useWishlistStatusQuery(gameId, !!user);
  
  // Game file loading from B2
  const game = gameData?.game;
  const gameFileUrl = game?.gameUrl || null;
  const { gameUrl } = useB2Game(gameFileUrl);
  
  // Application layer: Game actions (Command side of CQRS)
  const playMutation = usePlayGameMutation((url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (gameUrl) {
      window.open(gameUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Game loading",
        description: "Please wait while we prepare the game file",
        variant: "default",
      });
    }
  });
  
  const likeMutation = useLikeGameMutation(gameId);
  
  const addToWishlistMutation = useAddToWishlistMutation(
    gameId,
    () => setInWishlist(true)
  );
  
  const removeFromWishlistMutation = useRemoveFromWishlistMutation(
    gameId,
    () => setInWishlist(false)
  );
  
  // Update wishlist state from backend
  useEffect(() => {
    if (wishlistStatus?.inWishlist !== undefined) {
      setInWishlist(wishlistStatus.inWishlist);
    }
  }, [wishlistStatus]);
  
  // Event handlers
  const handlePlayGame = () => {
    playMutation.mutate(gameId);
  };
  
  const handleLikeGame = () => {
    likeMutation.mutate();
  };
  
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
  
  // Loading state
  if (isGameLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (gameError || !game) {
    return <GameNotFound />;
  }
  
  // Reviews data preparation
  const reviews: Review[] = reviewsData?.reviews || [];
  
  // Render the view with separated components
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <GameHeader 
        game={game}
        inWishlist={inWishlist}
        onPlayGame={handlePlayGame}
        onLikeGame={handleLikeGame}
        onWishlistToggle={handleWishlistToggle}
        isWishlistLoading={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
        isPlayLoading={playMutation.isPending}
        isLikeLoading={likeMutation.isPending}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <GameAbout game={game} />
            <GameReviews 
              reviews={reviews} 
              isLoading={areReviewsLoading} 
            />
          </div>
          
          {/* Sidebar */}
          <div>
            <GameDetailSidebar game={game} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}