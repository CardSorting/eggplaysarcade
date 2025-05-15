import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const DeveloperSection = () => {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Become a Game Developer
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Share your HTML5 games with our growing community. Upload your games and reach thousands of players.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-upload-cloud-line text-3xl text-primary"></i>
              </div>
              <h3 className="font-medium text-xl text-white mb-2">Upload Your Game</h3>
              <p className="text-gray-400">Submit your HTML5 game through our simple upload form with game details.</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-star-line text-3xl text-secondary"></i>
              </div>
              <h3 className="font-medium text-xl text-white mb-2">Gain Players</h3>
              <p className="text-gray-400">Get your game featured on our platform and attract players from around the world.</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-bar-chart-box-line text-3xl text-accent"></i>
              </div>
              <h3 className="font-medium text-xl text-white mb-2">Track Performance</h3>
              <p className="text-gray-400">Monitor your game's performance with detailed analytics and player feedback.</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              className="btn-primary bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium text-lg"
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

export default DeveloperSection;
