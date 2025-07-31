import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LocationCard from "@/components/LocationCard";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star,
  Sliders,
  Navigation
} from "lucide-react";

const Explore = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Spots', count: 0 },
    { id: 'beginner', label: '🟢 Beginner', count: 0 },
    { id: 'intermediate', label: '🟡 Intermediate', count: 0 },
    { id: 'advanced', label: '🔴 Advanced', count: 0 },
    { id: 'parking', label: '🅿️ Parking', count: 0 },
    { id: 'merging', label: '🔄 Merging', count: 0 },
    { id: 'roundabout', label: '⭕ Roundabouts', count: 0 }
  ];

  // Locations will be loaded from Firestore
  const locations: any[] = [];

  const handleSearch = () => {
    toast({
      title: "Search Feature",
      description: "Advanced search functionality coming soon!",
    });
  };

  const handleGetDirections = () => {
    toast({
      title: "Navigation",
      description: "GPS navigation integration coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Explore Practice Spots</h1>
          <p className="text-muted-foreground">
            Discover the best driving practice locations in your area
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location, features, or difficulty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => toast({ title: "Filters", description: "Advanced filters coming soon!" })}>
                <Sliders className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Filters */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="h-auto py-4 flex flex-col">
            <MapPin className="w-6 h-6 mb-2 text-primary" />
            <span className="font-medium">View on Map</span>
            <span className="text-xs text-muted-foreground">Interactive map view</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col" onClick={handleGetDirections}>
            <Navigation className="w-6 h-6 mb-2 text-accent" />
            <span className="font-medium">Nearest to Me</span>
            <span className="text-xs text-muted-foreground">Find closest spots</span>
          </Button>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Practice Locations</h2>
            <p className="text-sm text-muted-foreground">
              {locations.length} locations found
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Sort by Distance
          </Button>
        </div>

        {/* Location Results */}
        <div className="grid gap-4">
          {locations.length > 0 ? (
            locations.map((location, index) => (
              <LocationCard key={index} {...location} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No practice spots found</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to add practice locations in your area!
                </p>
                <Button onClick={() => toast({ title: "Add Location", description: "Feature coming soon!" })}>
                  Add First Location
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Load More - only show if there are locations */}
        {locations.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => toast({ title: "Load More", description: "Loading more locations..." })}>
              Load More Results
            </Button>
          </div>
        )}

        {/* Popular Categories */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl mb-2">🅿️</div>
                <p className="font-medium">Parking Practice</p>
                <p className="text-sm text-muted-foreground">89 locations</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl mb-2">🔄</div>
                <p className="font-medium">Merging Practice</p>
                <p className="text-sm text-muted-foreground">34 locations</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl mb-2">⭕</div>
                <p className="font-medium">Roundabouts</p>
                <p className="text-sm text-muted-foreground">28 locations</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl mb-2">🏫</div>
                <p className="font-medium">School Zones</p>
                <p className="text-sm text-muted-foreground">45 locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Explore;