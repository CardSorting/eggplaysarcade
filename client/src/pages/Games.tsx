import { useState, useEffect } from "react";
import { Helmet } from 'react-helmet';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import GameCard from "@/components/GameCard";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category, Game } from "@shared/schema";
import { Search } from "lucide-react";

const Games = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { toast } = useToast();

  // Get URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("categoryId");
    const search = urlParams.get("search");
    
    if (categoryId) {
      setCategoryFilter(categoryId);
    }
    
    if (search) {
      setSearchTerm(search);
    }
  }, []);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch games with filters
  const {
    data: games = [],
    isLoading,
    isError,
    refetch
  } = useQuery<Game[]>({
    queryKey: [
      "/api/games", 
      categoryFilter ? `?categoryId=${categoryFilter}` : searchTerm ? `?search=${searchTerm}` : ""
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCategoryFilter("");
      setLocation(`/games?search=${encodeURIComponent(searchTerm.trim())}`);
      refetch();
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSearchTerm("");
    setLocation(`/games?categoryId=${value}`);
    refetch();
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "";
  };

  if (isError) {
    toast({
      title: "Error",
      description: "Failed to load games. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <>
      <Helmet>
        <title>Browse Games - GameVault</title>
        <meta name="description" content="Browse and play HTML5 games from various categories. Find your next favorite game on GameVault." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold text-white mb-4">
            Browse Games
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <Input
                type="search"
                placeholder="Search games..."
                className="bg-card border-gray-700 text-white w-full pr-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-card border-gray-700 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-gray-700">
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                categoryName={getCategoryName(game.categoryId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <i className="ri-gamepad-line text-6xl text-gray-500 mb-4"></i>
            <h2 className="text-2xl font-medium text-white mb-2">No Games Found</h2>
            <p className="text-gray-400">
              {searchTerm 
                ? `No games matching "${searchTerm}"` 
                : categoryFilter 
                  ? "No games in this category yet" 
                  : "No games available at the moment"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Games;
