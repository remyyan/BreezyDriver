import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, Navigation, Filter, Plus, X, Clock, Car, ArrowLeft } from "lucide-react";
import { PracticeLocation } from "@/lib/firebase";
import { getLocations, getLocationById } from "@/lib/locationService";
import { useSearchParams, useNavigate } from 'react-router-dom';

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = 'pk.eyJ1IjoicmVteXlhbiIsImEiOiJjbWRqZjBwc2UwaW5uMmpxNzJmNmgyMmc0In0.wdhkYSWw_Sd4X2GmzMJtLw';
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PracticeLocation | null>(null);
  const [practiceLocations, setPracticeLocations] = useState<PracticeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get location ID from URL parameters
  const locationId = searchParams.get('location');

  // Load locations from Firebase
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const locations = await getLocations();
        setPracticeLocations(locations);

        // If a specific location is requested, find and select it
        if (locationId) {
          const targetLocation = locations.find(loc => loc.id === locationId);
          if (targetLocation) {
            setSelectedLocation(targetLocation);
          } else {
            // Try to fetch the specific location if not in the list
            try {
              const specificLocation = await getLocationById(locationId);
              if (specificLocation) {
                setSelectedLocation(specificLocation);
                setPracticeLocations(prev => [...prev, specificLocation]);
              }
            } catch (error) {
              console.error('Error fetching specific location:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading locations:', error);
        toast({
          title: "Error",
          description: "Failed to load practice locations.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [locationId, toast]);

  const initializeMap = () => {
    if (!mapContainer.current || isMapLoaded) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-79.3832, 43.6532], // Toronto center
        zoom: 11,
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      map.current.addControl(geolocate, 'top-right');

      map.current.on('load', () => {
        setIsMapLoaded(true);
        
        // Add practice locations as markers
        practiceLocations.forEach((location) => {
          // Skip locations without coordinates
          if (!location.coordinates) return;

          const el = document.createElement('div');
          el.className = 'marker';

          // Add difficulty color coding
          const difficultyColors = {
            'Beginner': '#22c55e',
            'Intermediate': '#eab308',
            'Advanced': '#ef4444'
          };
          
          el.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              background: ${difficultyColors[location.difficulty]};
              border: 3px solid white;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              transition: all 0.2s ease;
            " class="marker-inner">
              <svg width="20" height="20" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `;
          
          const innerEl = el.querySelector('.marker-inner') as HTMLElement;
          
          el.addEventListener('mouseenter', () => {
            if (innerEl) innerEl.style.transform = 'scale(1.1)';
          });
          
          el.addEventListener('mouseleave', () => {
            if (innerEl) innerEl.style.transform = 'scale(1)';
          });
          
          el.addEventListener('click', () => {
            setSelectedLocation(location);
            map.current?.flyTo({
              center: [location.coordinates!.longitude, location.coordinates!.latitude],
              zoom: 15,
              duration: 1500
            });
          });

          new mapboxgl.Marker(el)
            .setLngLat([location.coordinates.longitude, location.coordinates.latitude])
            .addTo(map.current!);
        });

        // If a specific location is selected, focus on it
        if (selectedLocation && selectedLocation.coordinates) {
          setTimeout(() => {
            map.current?.flyTo({
              center: [selectedLocation.coordinates!.longitude, selectedLocation.coordinates!.latitude],
              zoom: 15,
              duration: 2000
            });
          }, 1000);
        }

        toast({
          title: "Map Loaded Successfully",
          description: `Found ${practiceLocations.length} practice locations in your area!`,
        });
      });

    } catch (error) {
      toast({
        title: "Map Error",
        description: "Please check your Mapbox token and try again.",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddLocation = () => {
    toast({
      title: "Add New Practice Spot",
      description: "Click anywhere on the map to add a new practice location!",
    });
  };

  useEffect(() => {
    if (!loading && practiceLocations.length >= 0) {
      initializeMap();
    }

    return () => {
      map.current?.remove();
    };
  }, [loading, practiceLocations, selectedLocation]);

  return (
    <div className="h-screen flex flex-col bg-background pb-16">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {selectedLocation ? selectedLocation.name : 'Practice Locations Map'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedLocation ? selectedLocation.address : 'Discover safe spots to practice driving'}
              </p>
            </div>
          </div>
          <Button onClick={handleAddLocation} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Spot
          </Button>
        </div>

        {/* Loading State */}
        {!isMapLoaded && (
          <div className="mt-4 p-4 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading interactive map...</span>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            All
          </Button>
          <Button variant="outline" size="sm">
            🟢 Beginner
          </Button>
          <Button variant="outline" size="sm">
            🟡 Intermediate
          </Button>
          <Button variant="outline" size="sm">
            🔴 Advanced
          </Button>
          <Button variant="outline" size="sm">
            🅿️ Parking
          </Button>
          <Button variant="outline" size="sm">
            🔄 Merging
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Location Details Panel */}
        {selectedLocation && (
          <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{selectedLocation.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedLocation(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(selectedLocation.difficulty)}>
                      {selectedLocation.difficulty}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm">{selectedLocation.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({selectedLocation.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;