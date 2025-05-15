/**
 * Game header component that displays the main game information
 * and primary action buttons
 */
import { useAuth } from "@/hooks/use-auth";
import { useB2Image } from "@/hooks/use-b2-file";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Game } from "../types";
import { 
  Play,
  Heart,
  Share2,
  Star,
  Gamepad
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GameHeaderProps {
  game: Game;
  inWishlist: boolean;
  onPlayGame: () => void;
  onLikeGame: () => void;
  onWishlistToggle: () => void;
  isWishlistLoading: boolean;
  isPlayLoading: boolean;
  isLikeLoading: boolean;
}

export function GameHeader({
  game,
  inWishlist,
  onPlayGame,
  onLikeGame,
  onWishlistToggle,
  isWishlistLoading,
  isPlayLoading,
  isLikeLoading
}: GameHeaderProps) {
  const { user } = useAuth();
  const imageProps = useB2Image(game.thumbnailUrl || null);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game.title,
        text: game.description,
        url: window.location.href
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Game link copied to clipboard",
      });
    }
  };

  return (
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
              onClick={onPlayGame}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
              size="lg"
              disabled={isPlayLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Play Game
            </Button>
            
            <Button 
              onClick={onLikeGame} 
              variant="outline" 
              disabled={isLikeLoading}
            >
              <Heart className="mr-2 h-4 w-4" />
              Like
            </Button>
            
            <Button 
              onClick={onWishlistToggle}
              variant="outline"
              disabled={isWishlistLoading}
              className={inWishlist ? "bg-muted" : ""}
            >
              <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-primary text-primary" : ""}`} />
              {inWishlist ? "Wishlisted" : "Add to Wishlist"}
            </Button>
            
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}