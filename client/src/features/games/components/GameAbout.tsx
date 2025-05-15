/**
 * Game about component that displays detailed information
 * about the game, including instructions
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Game } from "../types";

interface GameAboutProps {
  game: Game;
}

export function GameAbout({ game }: GameAboutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{game.description}</p>
        
        <Separator className="my-6" />
        
        <h3 className="text-lg font-bold mb-4">How to Play</h3>
        <p>{game.instructions || "Just have fun playing the game!"}</p>
      </CardContent>
    </Card>
  );
}