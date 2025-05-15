import { Link } from "wouter";
import { Game } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { useB2Image } from "@/hooks/use-b2-file";
import { Skeleton } from "@/components/ui/skeleton";

interface LargeGameCardProps {
  game: Game;
}

const LargeGameCard = ({ game }: LargeGameCardProps) => {
  // Get the image props with B2 integration
  const imageProps = useB2Image(game.thumbnailUrl);
  const stars = Array(5).fill(0).map((_, index) => {
    if (index < Math.floor(game.rating || 0)) return "full";
    if (index === Math.floor(game.rating || 0) && game.rating % 1 >= 0.5) return "half";
    return "empty";
  });

  return (
    <Card className="game-card bg-card rounded-xl overflow-hidden">
      <Link href={`/games/${game.id}`}>
        <a className="block h-52 w-full overflow-hidden">
          {imageProps.src ? (
            <img 
              {...imageProps}
              alt={game.title} 
              className={`w-full h-52 object-cover hover:scale-105 transition-transform duration-300 ${imageProps.className}`}
            />
          ) : (
            <Skeleton className="w-full h-52" />
          )}
        </a>
      </Link>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-xl text-white">{game.title}</h3>
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-400 text-sm">{game.players || 0}</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{game.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            {stars.map((type, index) => (
              <span key={index}>
                {type === "full" && <Star className="h-4 w-4 fill-accent text-accent" />}
                {type === "half" && (
                  <span className="relative">
                    <Star className="h-4 w-4 text-accent" />
                    <Star className="absolute top-0 left-0 h-4 w-4 fill-accent text-accent overflow-hidden" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
                  </span>
                )}
                {type === "empty" && <Star className="h-4 w-4 text-accent" />}
              </span>
            ))}
            <span className="ml-1 text-white">{game.rating || "New"}</span>
          </div>
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white rounded-lg"
            asChild
          >
            <Link href={`/games/${game.id}`}>
              <a>Play Now</a>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LargeGameCard;
