import { Helmet } from 'react-helmet';
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from 'react';
import { ArrowRight, Star, TrendingUp, Trophy, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import HeroSection from "@/components/HeroSection";
import GameCard from "@/components/GameCard";
import LargeGameCard from "@/components/LargeGameCard";
import CategoryCard from "@/components/CategoryCard";
import DeveloperSection from "@/components/DeveloperSection";
import { Category, Game } from "@shared/schema";

const Home = () => {
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredGames = [], isLoading: featuredLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/featured"],
  });

  const { data: popularGames = [], isLoading: popularLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/popular"],
  });

  const { data: allGames = [], isLoading: allGamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "";
  };

  // Get top games for different categories
  const topRatedGames = [...allGames].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const newGames = [...allGames].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 4);

  // Promotional showcases (using featured games)
  const promoGames = featuredGames.slice(0, 3).map(game => ({
    ...game,
    promo: {
      tagline: "Featured Game",
      description: `${game.description.substring(0, 120)}...`,
      color: "bg-gradient-to-r from-purple-600 to-blue-600",
    }
  }));

  return (
    <>
      <Helmet>
        <title>GameVault - HTML5 Game Platform</title>
        <meta name="description" content="Discover, play and share amazing HTML5 games created by developers from around the world on GameVault." />
      </Helmet>

      {/* App Store Style Promotion Carousel */}
      <section className="py-6 pt-4 bg-background">
        <div className="container mx-auto px-4">
          <Carousel 
            className="w-full"
            onSelect={(index) => setCurrentPromoSlide(index)}
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent>
              {promoGames.map((game, index) => (
                <CarouselItem key={game.id} className="md:basis-4/5 lg:basis-3/4">
                  <Link href={`/games/${game.id}`}>
                    <div className={`relative rounded-xl overflow-hidden h-64 md:h-96 ${game.promo.color}`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10"></div>
                      <img 
                        src={game.thumbnailUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover object-center" 
                      />
                      <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full md:w-2/3">
                        <Badge variant="secondary" className="mb-3">
                          {game.promo.tagline}
                        </Badge>
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                          {game.title}
                        </h2>
                        <p className="text-white/80 mb-4 hidden md:block">
                          {game.promo.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <Button className="rounded-full px-6">
                            Play Now
                          </Button>
                          <div className="flex items-center text-white">
                            <Star className="fill-yellow-400 text-yellow-400 h-4 w-4 mr-1" />
                            <span className="font-medium">{game.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4 gap-1">
              {promoGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromoSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentPromoSlide === index ? "w-6 bg-primary" : "w-2 bg-gray-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* App Store Style Tabs for Game Collections */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="featured" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Discover Games
              </h2>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="featured" className="text-sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  Featured
                </TabsTrigger>
                <TabsTrigger value="top" className="text-sm">
                  <Star className="w-4 h-4 mr-2" />
                  Top Rated
                </TabsTrigger>
                <TabsTrigger value="popular" className="text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="new" className="text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  New
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="featured" className="mt-0">
              {featuredLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                      <div className="w-full h-48 bg-muted"></div>
                      <div className="p-4">
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-muted rounded w-1/5"></div>
                          <div className="h-8 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredGames.map((game) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      categoryName={getCategoryName(game.categoryId)}
                    />
                  ))}
                </div>
              )}
              <div className="mt-6 text-center">
                <Link href="/games">
                  <Button variant="outline" className="rounded-full px-8">
                    View All Games
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="top" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topRatedGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    categoryName={getCategoryName(game.categoryId)}
                  />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/games?sort=rating">
                  <Button variant="outline" className="rounded-full px-8">
                    View All Top Rated
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              {popularLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                      <div className="w-full h-48 bg-muted"></div>
                      <div className="p-4">
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-muted rounded w-1/5"></div>
                          <div className="h-8 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {popularGames.map((game) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      categoryName={getCategoryName(game.categoryId)}
                    />
                  ))}
                </div>
              )}
              <div className="mt-6 text-center">
                <Link href="/games?sort=players">
                  <Button variant="outline" className="rounded-full px-8">
                    View All Popular
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    categoryName={getCategoryName(game.categoryId)}
                  />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/games?sort=new">
                  <Button variant="outline" className="rounded-full px-8">
                    View All New Releases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Browse by Category
            </h2>
            <Link href="/categories" className="text-accent hover:text-accent/80 font-medium flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex space-x-4">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/games?category=${category.id}`}
                  className="inline-block"
                >
                  <Card className="w-[180px] bg-background/50 border-accent/20 hover:border-accent/50 transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <i className={`${category.icon} text-4xl text-accent mb-3`}></i>
                      <h3 className="font-medium text-center">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      {/* App Store Style Popular Games Horizontal Scroll */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Top Picks For You
            </h2>
            <Link href="/games?sort=players" className="text-accent hover:text-accent/80 font-medium flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {popularLoading ? (
            <div className="flex space-x-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse min-w-[320px]">
                  <div className="w-full h-52 bg-muted"></div>
                  <div className="p-5">
                    <div className="h-7 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-10 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex space-x-6">
                {popularGames.map((game) => (
                  <div key={game.id} className="inline-block w-[360px]">
                    <LargeGameCard game={game} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>
      </section>

      {/* Enhanced Developer Section */}
      <DeveloperSection />
    </>
  );
};

export default Home;
