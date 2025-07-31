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
    { id: 'all', label: 'All Spots', count: 247 },
    { id: 'beginner', label: '🟢 Beginner', count: 156 },
    { id: 'intermediate', label: '🟡 Intermediate', count: 72 },
    { id: 'advanced', label: '🔴 Advanced', count: 19 },
    { id: 'parking', label: '🅿️ Parking', count: 89 },
    { id: 'merging', label: '🔄 Merging', count: 34 },
    { id: 'roundabout', label: '⭕ Roundabouts', count: 28 }
  ];

  const locations = [
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
    },
    {
      name: "Highway 407 On-Ramp Practice",
      address: "Highway 407, Vaughan, ON",
      rating: 3.9,
      reviewCount: 42,
      difficulty: 'Advanced' as const,
      features: ["Highway merging", "High speed", "Real traffic", "Experienced only"],
      distance: "12.4 km",
      lastReview: "1 day ago"
    },
    {
      name: "Square One Mall Parking",
      address: "100 City Centre Dr, Mississauga, ON",
      rating: 4.3,
      reviewCount: 98,
      difficulty: 'Intermediate' as const,
      features: ["Busy environment", "Pedestrians", "Multiple levels", "Various challenges"],
      distance: "8.7 km",
      lastReview: "4 days ago"
    }
  ];

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
          {locations.map((location, index) => (
            <LocationCard key={index} {...location} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => toast({ title: "Load More", description: "Loading more locations..." })}>
            Load More Results
          </Button>
        </div>

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