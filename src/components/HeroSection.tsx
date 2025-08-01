import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-practice-street.jpg";

const HeroSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleExploreSpots = () => {
    toast({
      title: "Explore Practice Spots",
      description: "Scrolling to nearby practice locations below!",
    });
    // Scroll to locations section
    const locationsSection = document.getElementById('locations-showcase');
    locationsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddLocation = () => {
    navigate('/add-location');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* App Logo/Name */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              Breezy<span className="text-accent">Driver</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium opacity-90">
              Ontario's #1 Practice Spot Discovery App
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 leading-tight">
            Find the Perfect Practice Locations for New G1 Drivers
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Discover safe, beginner-friendly practice spots recommended by the community. 
            From quiet parking lots to gentle residential streets - find your confidence on the road.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 mb-2 text-accent" />
              <span className="text-sm font-medium">Find Nearby Spots</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 mb-2 text-accent" />
              <span className="text-sm font-medium">Community Ratings</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 mb-2 text-accent" />
              <span className="text-sm font-medium">User Reviews</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 mb-2 text-accent" />
              <span className="text-sm font-medium">Safety First</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 font-semibold min-w-48"
              onClick={handleExploreSpots}
            >
              Explore Practice Spots
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 font-semibold min-w-48 border-white text-white bg-white/10 hover:bg-white/20"
              onClick={handleAddLocation}
            >
              Add a Location
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm opacity-75 mb-4">Trusted by new drivers across Ontario</p>
            <div className="flex justify-center items-center space-x-8 text-sm opacity-60">
              <span>🚗 1,200+ Practice Spots</span>
              <span>⭐ 4.8/5 Average Rating</span>
              <span>👥 5,000+ Community Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;