import { useState } from "react";
import { Helmet } from 'react-helmet';
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Category, 
  Game, 
  Rating 
} from "@shared/schema";
import { 
  AlertCircle, 
  Star, 
  User, 
  Gamepad2, 
  Play, 
  Info, 
  Settings, 
  Bookmark, 
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const gameId = parseInt(id);

  // Fetch game details
  const { 
    data: game, 
    isLoading: gameLoading, 
    isError: gameError 
  } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
  });

  // Fetch categories for displaying category name
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest("POST", `/api/games/${gameId}/rate`, { value: rating });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your rating has been submitted",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRating = (value: number) => {
    ratingMutation.mutate(value);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.title || "Check out this game",
        text: game?.description || "I found this awesome game on GameVault",
        url: window.location.href,
      }).catch(() => {
        // Fallback if share fails
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Game link copied to clipboard",
    });
  };

  // Get category name from id
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "";
  };

  // Get category badge color
  const getCategoryBadgeClass = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'puzzle':
        return 'bg-secondary/20 text-secondary';
      case 'adventure':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  // Create star rating display
  const renderStars = (rating?: number) => {
    const stars = [];
    const ratingValue = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingValue)) {
        stars.push(<Star key={i} className="h-4 w-4 fill-accent text-accent" />);
      } else if (i === Math.ceil(ratingValue) && ratingValue % 1 !== 0) {
        stars.push(
          <span key={i} className="relative">
            <Star className="h-4 w-4 text-accent" />
            <Star className="absolute top-0 left-0 h-4 w-4 fill-accent text-accent overflow-hidden" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
          </span>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-accent" />);
      }
    }
    
    return stars;
  };

  // Handle displaying error
  if (gameError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Game Not Found</h1>
            </div>
            <p className="mt-4 text-gray-600">
              Sorry, the game you're looking for doesn't exist or has been removed.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/games">
                  <a>Browse Games</a>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {game && (
        <Helmet>
          <title>{game.title} - GameVault</title>
          <meta name="description" content={game.description} />
        </Helmet>
      )}

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {gameLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 bg-muted rounded-full w-20"></div>
                  <div className="h-6 bg-muted rounded-full w-24"></div>
                  <div className="h-6 bg-muted rounded-full w-36"></div>
                </div>
                <div className="h-20 bg-muted rounded w-full mb-8"></div>
                <div className="aspect-video bg-muted rounded-xl mb-8"></div>
              </div>
            ) : game ? (
              <>
                {/* Game Info Header */}
                <div className="mb-8">
                  <h1 className="font-heading text-3xl font-bold text-white mb-2">
                    {game.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Badge
                      variant="outline"
                      className={`${getCategoryBadgeClass(getCategoryName(game.categoryId))} border-0 rounded-full text-xs px-3 py-1.5`}
                    >
                      {getCategoryName(game.categoryId)}
                    </Badge>
                    
                    {game.tags && game.tags.length > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-primary/20 text-primary border-0 rounded-full text-xs px-3 py-1.5"
                      >
                        {game.tags[0]}
                      </Badge>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      {renderStars(game.rating)}
                      <span className="text-white text-sm ml-1">
                        {game.rating ? `${game.rating.toFixed(1)}` : "New"}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-400 text-sm">{game.players} players</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Gamepad2 className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-400 text-sm">
                        Created {new Date(game.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6">
                    {game.description}
                  </p>
                </div>
                
                {/* Game Preview Area */}
                <div className="bg-background rounded-xl overflow-hidden mb-8">
                  {isPlaying ? (
                    <div className="aspect-video bg-black relative">
                      <iframe 
                        src={game.gameUrl}
                        className="w-full h-full absolute inset-0 border-0"
                        title={game.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video bg-black relative flex items-center justify-center">
                      <img 
                        src={game.thumbnailUrl} 
                        alt={`${game.title} gameplay`} 
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="icon"
                          className="bg-primary/90 hover:bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center transition"
                          onClick={() => setIsPlaying(true)}
                        >
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Game Controls/Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-card/60">
                    <CardContent className="p-5">
                      <h3 className="font-medium text-lg text-white mb-3 flex items-center">
                        <Gamepad2 className="h-5 w-5 text-primary mr-2" /> Controls
                      </h3>
                      <div className="space-y-2 text-gray-300">
                        {game.instructions.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/60">
                    <CardContent className="p-5">
                      <h3 className="font-medium text-lg text-white mb-3 flex items-center">
                        <Settings className="h-5 w-5 text-secondary mr-2" /> Features
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        {game.tags && game.tags.map((tag, index) => (
                          <li key={index} className="flex items-center">
                            <i className="ri-checkbox-circle-line text-secondary mr-2"></i> {tag}
                          </li>
                        ))}
                        {(!game.tags || game.tags.length === 0) && (
                          <li className="text-gray-400">No features listed</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/60">
                    <CardContent className="p-5">
                      <h3 className="font-medium text-lg text-white mb-3 flex items-center">
                        <Info className="h-5 w-5 text-accent mr-2" /> Game Info
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center">
                          <span className="text-gray-400 mr-2">Released:</span> 
                          {new Date(game.publishedAt).toLocaleDateString()}
                        </li>
                        <li className="flex items-center">
                          <span className="text-gray-400 mr-2">Category:</span> 
                          {getCategoryName(game.categoryId)}
                        </li>
                        <li className="flex items-center">
                          <span className="text-gray-400 mr-2">Players:</span> 
                          {game.players}
                        </li>
                        <li className="flex items-center">
                          <span className="text-gray-400 mr-2">Rating:</span>
                          {game.rating ? `${game.rating.toFixed(1)}/5` : "No ratings yet"}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="btn-primary bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium text-lg flex-1 flex items-center justify-center h-auto"
                    onClick={() => setIsPlaying(true)}
                    disabled={isPlaying}
                  >
                    <Gamepad2 className="mr-2 h-5 w-5" /> 
                    {isPlaying ? "Playing Now" : "Play Now"}
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-secondary bg-card/50 hover:bg-card/80 text-white border-gray-700 px-6 py-3 rounded-xl font-medium flex items-center justify-center h-auto"
                    onClick={() => {
                      toast({
                        title: "Added to favorites",
                        description: "This game has been added to your favorites",
                      });
                    }}
                  >
                    <Bookmark className="mr-2 h-5 w-5" /> Add to Favorites
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-secondary bg-card/50 hover:bg-card/80 text-white border-gray-700 px-6 py-3 rounded-xl font-medium flex items-center justify-center h-auto"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-5 w-5" /> Share
                  </Button>
                </div>
                
                {/* Rating Section */}
                <div className="mt-8 p-6 bg-card/60 rounded-xl">
                  <h3 className="font-medium text-lg text-white mb-4">Rate this game</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          className="p-1"
                          onClick={() => handleRating(rating)}
                          disabled={ratingMutation.isPending}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              rating <= (ratingMutation.isPending ? 0 : game.rating || 0)
                                ? "fill-accent text-accent"
                                : "text-gray-600 hover:text-accent"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {ratingMutation.isPending ? (
                      <span className="text-gray-400">Submitting rating...</span>
                    ) : (
                      <span className="text-gray-400">Click to rate this game</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-medium text-white mb-2">Game Not Found</h2>
                <p className="text-gray-400 mb-6">
                  The game you're looking for doesn't exist or has been removed.
                </p>
                <Button asChild>
                  <Link href="/games">
                    <a>Browse Games</a>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default GameDetails;
