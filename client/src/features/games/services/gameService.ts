/**
 * Game services that encapsulate application logic
 * Following Clean Architecture, this acts as a use case layer
 * 
 * This provides a clear boundary between UI and domain logic
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { 
  Game, 
  GameDetailQuery, 
  ReviewsListQuery, 
  WishlistStatusQuery 
} from "../types";

/**
 * Fetch a game by ID
 */
export function useGameQuery(gameId: number) {
  return useQuery<GameDetailQuery>({
    queryKey: [`/api/games/${gameId}`],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
}

/**
 * Fetch reviews for a game
 */
export function useGameReviewsQuery(gameId: number) {
  return useQuery<ReviewsListQuery>({
    queryKey: [`/api/games/${gameId}/reviews`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!gameId
  });
}

/**
 * Check if a game is in the user's wishlist
 */
export function useWishlistStatusQuery(gameId: number, enabled = true) {
  return useQuery<WishlistStatusQuery>({
    queryKey: [`/api/wishlist/check/${gameId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: enabled
  });
}

/**
 * Play a game (CQRS command pattern)
 */
export function usePlayGameMutation(onSuccess?: (gameUrl: string | null) => void) {
  return useMutation({
    mutationFn: async (gameId: number) => {
      const res = await apiRequest('POST', `/api/games/${gameId}/play`);
      return res.json();
    },
    onSuccess: (data) => {
      if (onSuccess && data?.url) {
        onSuccess(data.url);
      } else if (onSuccess) {
        onSuccess(null);
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
}

/**
 * Like a game (CQRS command pattern)
 */
export function useLikeGameMutation(gameId: number) {
  return useMutation({
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
}

/**
 * Add a game to wishlist (CQRS command pattern)
 */
export function useAddToWishlistMutation(gameId: number, onSuccess?: () => void) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wishlist', { gameId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      queryClient.invalidateQueries({ queryKey: [`/api/wishlist/check/${gameId}`] });
      toast({
        title: "Added to wishlist",
        description: "Game has been added to your wishlist",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add game to wishlist",
        variant: "destructive",
      });
    },
  });
}

/**
 * Remove a game from wishlist (CQRS command pattern)
 */
export function useRemoveFromWishlistMutation(gameId: number, onSuccess?: () => void) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/wishlist/${gameId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      queryClient.invalidateQueries({ queryKey: [`/api/wishlist/check/${gameId}`] });
      toast({
        title: "Removed from wishlist",
        description: "Game has been removed from your wishlist",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to remove game from wishlist",
        variant: "destructive",
      });
    },
  });
}