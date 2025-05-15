import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Gamepad,
  Share2,
  Star,
  MessageSquare,
  Tag,
  Calendar,
  User,
  Download,
  Info,
  ShieldCheck,
  Award,
  Play,
  ChevronRight,
  ExternalLink,
  Heart,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

// Detail Hero section with cover image
const GameHero = ({ game }: { game: any }) => {
  return (
    <div className="relative h-[400px] bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full opacity-30">
        {game.assets.headerImageUrl && (
          <img 
            src={game.assets.headerImageUrl} 
            alt={game.metadata.title} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      
      {/* Content */}
      <div className="container relative z-10 h-full flex flex-col justify-end pb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Game Icon */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg border-4 border-background">
            <img 
              src={game.assets.iconUrl || "https://via.placeholder.com/128"} 
              alt={game.metadata.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Game Info */}
          <div className="flex-1">
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{game.metadata.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Link href={`/developer/${game.developer.id}`} className="text-white/80 hover:text-white">
                  {game.developer.name}
                </Link>
                {game.verificationStatus === 'verified' && (
                  <Badge variant="outline" className="bg-green-500/20 border-green-500 text-white">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {game.metadata.categories.map((category: string) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
            <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
              <Play className="mr-2 h-4 w-4" />
              Play Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rating stars component
const RatingStars = ({ rating, size = "md" }: { rating: number, size?: "sm" | "md" | "lg" }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const starSizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const starClass = starSizes[size];
  
  return (
    <div className="flex">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={`${starClass} fill-yellow-400 text-yellow-400`} />
      ))}
      
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${starClass} text-muted-foreground`} />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className={`${starClass} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )}
      
      {Array.from({ length: totalStars - fullStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starClass} text-muted-foreground`} />
      ))}
    </div>
  );
};

// Screenshot carousel with lightbox
const ScreenshotGallery = ({ screenshots }: { screenshots: string[] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <>
      <Carousel className="w-full">
        <CarouselContent>
          {screenshots.map((src, index) => (
            <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
              <div 
                className="relative h-48 md:h-64 rounded-lg overflow-hidden cursor-pointer" 
                onClick={() => {
                  setActiveIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <img 
                  src={src} 
                  alt={`Screenshot ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform hover:scale-105" 
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-black/90 border-none">
          <div className="relative">
            <img 
              src={screenshots[activeIndex]} 
              alt={`Screenshot ${activeIndex + 1}`} 
              className="w-full h-auto"
            />
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setActiveIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1))}
              >
                <CarouselPrevious />
              </Button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setActiveIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))}
              >
                <CarouselNext />
              </Button>
            </div>
          </div>
          <div className="text-center text-white">
            {activeIndex + 1} / {screenshots.length}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Review component
const Review = ({ review }: { review: any }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{review.user.username.charAt(0)}</AvatarFallback>
              {review.user.avatarUrl && (
                <AvatarImage src={review.user.avatarUrl} alt={review.user.username} />
              )}
            </Avatar>
            <div>
              <div className="font-medium">{review.user.username}</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <RatingStars rating={review.rating} size="sm" />
            <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm whitespace-pre-line">{review.content}</p>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsUp className="mr-1 h-4 w-4" />
            <span className="text-xs">{review.helpfulCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsDown className="mr-1 h-4 w-4" />
            <span className="text-xs">{review.unhelpfulCount || 0}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Game Detail Page
const GameDetailPage = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const params = useParams<{ id: string }>();
  const gameId = params.id;
  const [, navigate] = useLocation();
  
  // Fetch game details
  const { data: gameData, isLoading, error } = useQuery({
    queryKey: [`/api/games/${gameId}`],
    queryFn: getQueryFn()
  });
  
  // Fetch reviews
  const { data: reviewsData } = useQuery({
    queryKey: [`/api/games/${gameId}/reviews`],
    queryFn: getQueryFn()
  });
  
  // Play game mutation
  const playGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/games/${gameId}/play`);
      return res.json();
    },
    onSuccess: (data) => {
      // Redirect to the sandbox URL
      window.open(data.sandboxUrl, '_blank', 'noopener,noreferrer');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to launch game",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Like game mutation
  const likeGameMutation = useMutation({
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
  
  // Handle play button click
  const handlePlayGame = () => {
    playGameMutation.mutate();
  };
  
  // Handle like button click
  const handleLikeGame = () => {
    likeGameMutation.mutate();
  };
  
  // Create mock data if real data is not available yet
  const mockGame = {
    id: gameId,
    metadata: {
      title: "Space Explorer",
      description: "Space Explorer is an exciting adventure game where you explore the vastness of space. Discover new planets, gather resources, build your fleet, and uncover the mysteries of the universe in this captivating space simulation game.\n\nExperience realistic physics, stunning visuals, and an immersive soundtrack as you navigate through various solar systems and galaxies. Encounter alien civilizations, establish trade routes, and defend your discoveries from space pirates.",
      shortDescription: "Explore the vastness of space in this exciting adventure",
      features: [
        "Procedurally generated universe with billions of unique planets",
        "Realistic physics simulation for immersive space travel",
        "Complex resource management and crafting system",
        "Build and customize your own spaceship fleet",
        "Encounter alien civilizations and establish diplomatic relations",
        "Dynamic economy with trading opportunities across the galaxy",
        "Epic space battles with strategic combat mechanics"
      ],
      categories: ["Adventure", "Space", "Simulation", "Strategy"],
      tags: ["sci-fi", "open-world", "multiplayer", "exploration"],
      minimumSystemRequirements: {
        browser: "Chrome 80+, Firefox 75+, Edge 80+, Safari 13+",
        cpu: "2GHz dual-core processor",
        ram: "4 GB RAM",
        gpu: "WebGL 2.0 compatible",
        os: "Windows 7+, macOS 10.12+, Linux"
      },
      recommendedSystemRequirements: {
        browser: "Chrome 90+, Firefox 90+, Edge 90+, Safari 14+",
        cpu: "3GHz quad-core processor",
        ram: "8 GB RAM",
        gpu: "Dedicated GPU with WebGL 2.0 support",
        os: "Windows 10+, macOS 10.15+, Linux"
      },
      contentRating: "Everyone 10+",
      languageSupport: ["English", "Spanish", "French", "German", "Japanese"],
      privacyPolicyUrl: "https://example.com/privacy",
      termsOfServiceUrl: "https://example.com/terms",
      supportEmail: "support@spaceworld.com",
      supportUrl: "https://spaceworld.com/support",
      releaseNotes: "Version 1.2.0 brings new galaxies to explore and improved spaceship customization options."
    },
    assets: {
      iconUrl: "https://via.placeholder.com/128",
      headerImageUrl: "https://via.placeholder.com/1920x1080",
      screenshotUrls: [
        "https://via.placeholder.com/1280x720",
        "https://via.placeholder.com/1280x720",
        "https://via.placeholder.com/1280x720",
        "https://via.placeholder.com/1280x720",
        "https://via.placeholder.com/1280x720"
      ],
      videoTrailerUrls: ["https://example.com/trailer.mp4"]
    },
    developer: {
      id: "dev123",
      name: "Cosmic Games Studio",
      verified: true
    },
    stats: {
      rating: 4.6,
      ratingCount: 256,
      totalPlays: 12480,
      likes: 342
    },
    releaseDate: new Date(2023, 2, 15),
    currentVersion: "1.2.0",
    pricingTier: "FREE",
    verificationStatus: "verified",
    isLiked: false
  };
  
  const mockReviews = [
    {
      id: "r1",
      user: {
        id: "u1",
        username: "SpaceFan42",
        avatarUrl: null
      },
      rating: 5,
      content: "This is the best space exploration game I've played! The universe feels truly vast and there's always something new to discover. I love the ship customization options and the trade mechanics are well balanced.",
      createdAt: new Date(2023, 3, 10),
      helpfulCount: 24,
      unhelpfulCount: 2
    },
    {
      id: "r2",
      user: {
        id: "u2",
        username: "GameReviewer",
        avatarUrl: null
      },
      rating: 4,
      content: "Great game with stunning visuals. The physics simulation makes space travel feel realistic. Only giving 4 stars because some of the later missions get repetitive, but overall it's an excellent experience.",
      createdAt: new Date(2023, 2, 25),
      helpfulCount: 18,
      unhelpfulCount: 3
    },
    {
      id: "r3",
      user: {
        id: "u3",
        username: "AstroNomad",
        avatarUrl: null
      },
      rating: 5,
      content: "I've spent countless hours exploring the universe in this game. The attention to detail is impressive, from the planet surfaces to the space stations. The multiplayer fleet battles are incredibly fun!",
      createdAt: new Date(2023, 3, 5),
      helpfulCount: 15,
      unhelpfulCount: 0
    }
  ];
  
  // Use real data when available, otherwise use mock data
  const game = gameData?.game || mockGame;
  const reviews = reviewsData?.reviews || mockReviews;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
        <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <GameHero game={game} />
      
      {/* Main Content */}
      <main className="container py-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">About this game</h2>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {game.metadata.description}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">Top Features</h3>
                    <ul className="space-y-2">
                      {game.metadata.features.slice(0, 4).map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {game.metadata.features.length > 4 && (
                      <Button 
                        variant="link" 
                        className="mt-2 p-0"
                        onClick={() => setSelectedTab("features")}
                      >
                        See all features
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">Screenshots</h3>
                    <ScreenshotGallery screenshots={game.assets.screenshotUrls} />
                    <Button 
                      variant="link" 
                      className="mt-2 p-0"
                      onClick={() => setSelectedTab("media")}
                    >
                      See all media
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Features</h2>
                    <ul className="space-y-3">
                      {game.metadata.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Minimum Requirements</h3>
                      <div className="space-y-2">
                        {Object.entries(game.metadata.minimumSystemRequirements).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <div className="font-semibold capitalize w-24">{key}:</div>
                            <div className="flex-1">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">Recommended</h3>
                      <div className="space-y-2">
                        {Object.entries(game.metadata.recommendedSystemRequirements).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <div className="font-semibold capitalize w-24">{key}:</div>
                            <div className="flex-1">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
                    <ScreenshotGallery screenshots={game.assets.screenshotUrls} />
                  </div>
                  
                  {game.assets.videoTrailerUrls && game.assets.videoTrailerUrls.length > 0 && (
                    <>
                      <Separator />
                      
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Trailers</h2>
                        <div className="grid grid-cols-1 gap-4">
                          {game.assets.videoTrailerUrls.map((url: string, i: number) => (
                            <div key={i} className="aspect-video rounded-lg overflow-hidden">
                              <iframe 
                                src={url} 
                                title={`Trailer ${i+1}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Player Reviews</h2>
                    <Button>Write a Review</Button>
                  </div>
                  
                  <div className="flex items-center justify-center bg-muted p-6 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{game.stats.rating.toFixed(1)}</div>
                      <div className="mt-2">
                        <RatingStars rating={game.stats.rating} size="lg" />
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Based on {game.stats.ratingCount} reviews
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <Review key={review.id} review={review} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                        <p className="text-muted-foreground">Be the first to review this game!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                {/* Action buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handlePlayGame} 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                    size="lg"
                    disabled={playGameMutation.isPending}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Game
                  </Button>
                  
                  <Button 
                    onClick={handleLikeGame} 
                    variant="outline" 
                    className="w-full"
                    disabled={likeGameMutation.isPending}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${game.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {game.isLiked ? 'Liked' : 'Like'}
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                
                <Separator />
                
                {/* Game info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <div className="font-medium">
                      {game.stats.rating.toFixed(1)} ({game.stats.ratingCount} ratings)
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gamepad className="h-5 w-5 text-muted-foreground" />
                    <div>{game.stats.totalPlays.toLocaleString()} plays</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>{game.pricingTier}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>Released {format(new Date(game.releaseDate), 'MMM d, yyyy')}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>Version {game.currentVersion}</div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Developer info */}
                <div>
                  <h3 className="font-semibold mb-2">Developer</h3>
                  <Link 
                    href={`/developer/${game.developer.id}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <User className="h-4 w-4" />
                    <span>{game.developer.name}</span>
                    {game.developer.verified && (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    )}
                  </Link>
                </div>
                
                {/* Categories & Tags */}
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.metadata.categories.map((category: string) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.metadata.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Links */}
                <div className="space-y-2">
                  <h3 className="font-semibold mb-2">Links</h3>
                  
                  {game.metadata.supportUrl && (
                    <a 
                      href={game.metadata.supportUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Support
                    </a>
                  )}
                  
                  {game.metadata.privacyPolicyUrl && (
                    <a 
                      href={game.metadata.privacyPolicyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Privacy Policy
                    </a>
                  )}
                  
                  {game.metadata.termsOfServiceUrl && (
                    <a 
                      href={game.metadata.termsOfServiceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Terms of Service
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GameDetailPage;