import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/LocationCard";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PracticeLocation } from "@/lib/firebase";
import { getRecentLocations } from "@/lib/locationService";
import { getCachedAppStats, AppStats } from "@/lib/statsService";

const LocationsShowcase = () => {
  const { toast } = useToast();
  const [featuredLocations, setFeaturedLocations] = useState<PracticeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [appStats, setAppStats] = useState<AppStats>({
    totalLocations: 0,
    totalReviews: 0,
    averageRating: 0,
    recentSubmissions: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch locations and stats in parallel
        const [locations, stats] = await Promise.all([
          getRecentLocations(6),
          getCachedAppStats()
        ]);

        setFeaturedLocations(locations);
        setAppStats(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

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
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : featuredLocations.length > 0 ? (
            featuredLocations.map((location, index) => (
              <LocationCard
                key={location.id || index}
                {...location}
                distance={`${(Math.random() * 10 + 1).toFixed(1)} km`} // Mock distance for now
                lastReview={`${Math.floor(Math.random() * 30 + 1)} days ago`} // Mock last review
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No practice spots yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to add practice locations in your area!
              </p>
              <Button onClick={handleAddSpot}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Location
              </Button>
            </div>
          )}
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
            <div className="text-2xl font-bold text-primary">{appStats.totalLocations}</div>
            <div className="text-sm text-muted-foreground">Practice Spots</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-secondary">{appStats.totalReviews}</div>
            <div className="text-sm text-muted-foreground">Community Reviews</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-warning">
              {appStats.averageRating > 0 ? appStats.averageRating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-accent">{appStats.recentSubmissions}</div>
            <div className="text-sm text-muted-foreground">Recent Submissions</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsShowcase;