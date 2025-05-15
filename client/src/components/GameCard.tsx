import { Link } from "wouter";
import { Game } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useB2Image } from "@/hooks/use-b2-file";
import { Skeleton } from "@/components/ui/skeleton";

interface GameCardProps {
  game: Game;
  categoryName?: string;
}

const GameCard = ({ game, categoryName }: GameCardProps) => {
  // Get the image props with B2 integration
  const imageProps = useB2Image(game.thumbnailUrl);
  
  return (
    <Card className="game-card bg-card rounded-xl overflow-hidden">
      <Link href={`/games/${game.id}`} className="block h-48 w-full overflow-hidden">
          {imageProps.src ? (
            <img 
              {...imageProps}
              alt={game.title} 
              className={`w-full h-48 object-cover hover:scale-105 transition-transform duration-300 ${imageProps.className}`}
            />
          ) : (
            <Skeleton className="w-full h-48" />
          )}
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg text-white">{game.title}</h3>
          <Badge
            variant="outline"
            className={`bg-${categoryName === 'Puzzle' ? 'secondary' : categoryName === 'Adventure' ? 'primary' : 'accent'}/20 text-${categoryName === 'Puzzle' ? 'secondary' : categoryName === 'Adventure' ? 'primary' : 'accent'} border-0 rounded-full text-xs`}
          >
            {categoryName || "Game"}
          </Badge>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{game.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-accent text-accent mr-1" />
            <span className="ml-1 text-white">{game.rating || "New"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-primary/20 hover:bg-primary/30 text-primary border-0 rounded-lg"
            asChild
          >
            <Link href={`/games/${game.id}`}>
              Play Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;
