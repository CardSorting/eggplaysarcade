import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0 opacity-50" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-white">
            Play & Create <span className="text-accent">HTML5 Games</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8">
            Discover, play and share amazing web games created by developers from around the world
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="btn-primary bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full font-medium text-lg h-auto"
              asChild
            >
              <Link href="/games">
                <a>Explore Games</a>
              </Link>
            </Button>
            <Button 
              className="btn-secondary bg-secondary hover:bg-secondary/90 text-white px-8 py-6 rounded-full font-medium text-lg h-auto"
              asChild
            >
              <Link href="/submit">
                <a>Submit Your Game</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
