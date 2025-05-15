import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { GameControllerIcon, GamesLogo } from "@/lib/icons";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/games?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignIn = () => {
    toast({
      title: "Sign In",
      description: "Sign in functionality is not implemented in this demo.",
    });
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Games", path: "/games" },
    { name: "Categories", path: "/games" },
    { name: "Submit Game", path: "/submit" },
  ];

  return (
    <header className="bg-background border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer">
            <GamesLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className={`nav-link text-white hover:text-accent font-medium ${
                  (location === link.path || 
                  (link.path !== "/" && location.startsWith(link.path))) ? 
                  "text-accent active" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i className={`ri-${mobileMenuOpen ? "close" : "menu"}-line text-2xl`}></i>
            </Button>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search games..."
                className="rounded-full border-gray-800 bg-muted pl-4 pr-10 w-[200px] focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Button
              onClick={handleSignIn}
              className="bg-primary hover:bg-primary/90 text-white rounded-full btn-primary"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className="block py-2 text-white hover:text-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-3">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search games..."
                  className="w-full rounded-full border-gray-800 bg-muted pl-4 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full rounded-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button
                onClick={handleSignIn}
                className="bg-primary hover:bg-primary/90 text-white py-2 rounded-full"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
