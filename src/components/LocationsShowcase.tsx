import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/LocationCard";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Filter, Plus } from "lucide-react";

const LocationsShowcase = () => {
  const { toast } = useToast();
  
  const handleFilter = (filterName: string) => {
    toast({
      title: `Filter: ${filterName}`,
      description: "Filtering feature coming soon!",
    });
  };

  const handleAddSpot = () => {
    toast({
      title: "Add Practice Spot",
      description: "Feature coming soon! You'll be able to submit new locations.",
    });
  };

  const handleViewAll = () => {
    toast({
      title: "View All Locations",
      description: "Map view with all locations coming soon!",
    });
  };

  // Sample data - in real app this would come from Firebase
  const featuredLocations = [
    {
      name: "Centennial College Parking Lot",
      address: "941 Progress Ave, Scarborough, ON",
      rating: 4.8,
      reviewCount: 127,
      difficulty: 'Beginner' as const,
      features: ["Large spaces", "Cones available", "Security cameras", "Weekend access"],
      distance: "2.3 km",
      lastReview: "2 days ago"
    },
    {
      name: "Woodbine Beach Parking",
      address: "1675 Lake Shore Blvd E, Toronto, ON",
      rating: 4.6,
      reviewCount: 89,
      difficulty: 'Beginner' as const,
      features: ["Parallel parking", "Scenic view", "Low traffic", "Free parking"],
      distance: "3.1 km",
      lastReview: "1 week ago"
    },
    {
      name: "Industrial Road Practice",
      address: "Industrial Road, Mississauga, ON",
      rating: 4.2,
      reviewCount: 64,
      difficulty: 'Intermediate' as const,
      features: ["Real traffic", "Merging practice", "Multiple lanes", "Roundabout nearby"],
      distance: "5.8 km",
      lastReview: "3 days ago"
    },
    {
      name: "Sherway Gardens (Off Hours)",
      address: "25 The West Mall, Etobicoke, ON",
      rating: 4.5,
      reviewCount: 156,
      difficulty: 'Beginner' as const,
      features: ["Large lot", "Clear markings", "Security", "Food court nearby"],
      distance: "7.2 km",
      lastReview: "5 days ago"
    }
  ];

  return (
    <section id="locations-showcase" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Practice Spots Near You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the highest-rated practice locations recommended by fellow learners in your area.
          </p>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={() => handleFilter("All Levels")}
          >
            <Filter className="w-4 h-4 mr-2" />
            All Levels
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilter("Beginner")}
          >
            🟢 Beginner
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilter("Intermediate")}
          >
            🟡 Intermediate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilter("Within 5km")}
          >
            📍 Within 5km
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilter("Parking Practice")}
          >
            🅿️ Parking Practice
          </Button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {featuredLocations.map((location, index) => (
            <LocationCard key={index} {...location} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                Don't See Your Favorite Spot?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Help fellow learners by adding practice locations you've discovered. 
                Every contribution makes the community stronger!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  className="flex items-center"
                  onClick={handleAddSpot}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add a Practice Spot
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleViewAll}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View All Locations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-sm text-muted-foreground">Practice Spots</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-secondary">5,382</div>
            <div className="text-sm text-muted-foreground">Community Reviews</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-warning">4.7★</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-accent">12</div>
            <div className="text-sm text-muted-foreground">Cities Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsShowcase;