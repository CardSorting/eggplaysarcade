/**
 * Game reviews component for displaying user reviews
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Review } from "../types";
import { Star, User, MessageSquare } from "lucide-react";

interface GameReviewsProps {
  reviews: Review[];
  isLoading: boolean;
}

export function GameReviews({ reviews, isLoading }: GameReviewsProps) {
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
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
  );
}