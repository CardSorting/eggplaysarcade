/**
 * Game detail sidebar component
 * Shows additional metadata about the game
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Game } from "../types";

interface GameDetailSidebarProps {
  game: Game;
}

export function GameDetailSidebar({ game }: GameDetailSidebarProps) {
  return (
    <>
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
    </>
  );
}