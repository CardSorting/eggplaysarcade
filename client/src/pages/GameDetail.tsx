/**
 * Game detail page
 * This is a simple wrapper around the GameDetailContainer
 * Following DDD principles with a clean separation of concerns
 */
import { GameDetailContainer } from "@/features/games/GameDetailContainer";

/**
 * Game detail page that displays information about a specific game
 * and allows various interactions (playing, liking, wishlisting)
 */
export default function GameDetail() {
  // The entire implementation is delegated to the container component
  // This page acts as a simple entry point, making routing simpler
  return <GameDetailContainer />;
}