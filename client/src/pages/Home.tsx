import { Helmet } from 'react-helmet';
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import HeroSection from "@/components/HeroSection";
import GameCard from "@/components/GameCard";
import LargeGameCard from "@/components/LargeGameCard";
import CategoryCard from "@/components/CategoryCard";
import DeveloperSection from "@/components/DeveloperSection";
import { Category, Game } from "@shared/schema";

const Home = () => {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredGames = [], isLoading: featuredLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/featured"],
  });

  const { data: popularGames = [], isLoading: popularLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/popular"],
  });

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "";
  };

  return (
    <>
      <Helmet>
        <title>GameVault - HTML5 Game Platform</title>
        <meta name="description" content="Discover, play and share amazing HTML5 games created by developers from around the world on GameVault." />
      </Helmet>

      <HeroSection />

      {/* Featured Games Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Featured Games
            </h2>
            <Link href="/games" className="text-accent hover:text-accent/80 font-medium flex items-center">
              View All <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>

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
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-10">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Most Popular
            </h2>
            <Link href="/games" className="text-accent hover:text-accent/80 font-medium flex items-center">
              View All <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularGames.map((game) => (
                <LargeGameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </section>

      <DeveloperSection />
    </>
  );
};

export default Home;
