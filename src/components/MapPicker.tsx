import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, X, Navigation } from "lucide-react";
import { LocationCoordinates } from "@/lib/firebase";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coordinates: LocationCoordinates) => void;
  initialCoordinates?: LocationCoordinates;
}

const MapPicker = ({ isOpen, onClose, onLocationSelect, initialCoordinates }: MapPickerProps) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<LocationCoordinates | null>(
    initialCoordinates || null
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // MapBox token - same as used in MapView.tsx
  const mapboxToken = 'pk.eyJ1IjoicmVteXlhbiIsImEiOiJjbWRqZjBwc2UwaW5uMmpxNzJmNmgyMmc0In0.wdhkYSWw_Sd4X2GmzMJtLw';

  // Initialize MapBox map
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCoordinates ? [initialCoordinates.longitude, initialCoordinates.latitude] : [-79.3832, 43.6532],
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsMapLoaded(true);

        // Add initial marker if coordinates provided
        if (initialCoordinates) {
          addMarker(initialCoordinates);
        }
      });

      // Handle map clicks to place marker
      map.current.on('click', (e) => {
        const coordinates: LocationCoordinates = {
          latitude: parseFloat(e.lngLat.lat.toFixed(6)),
          longitude: parseFloat(e.lngLat.lng.toFixed(6))
        };

        setSelectedCoordinates(coordinates);
        addMarker(coordinates);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to load map. Please try again.",
        variant: "destructive"
      });
    }
  }, [isOpen, initialCoordinates]);

  // Add or update marker on map
  const addMarker = (coordinates: LocationCoordinates) => {
    if (!map.current) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({
      color: '#3b82f6',
      draggable: true
    })
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        const newCoordinates: LocationCoordinates = {
          latitude: parseFloat(lngLat.lat.toFixed(6)),
          longitude: parseFloat(lngLat.lng.toFixed(6))
        };
        setSelectedCoordinates(newCoordinates);
      }
    });
  };

  const handleConfirmLocation = () => {
    if (selectedCoordinates) {
      onLocationSelect(selectedCoordinates);
      onClose();
      toast({
        title: "Location Selected",
        description: `Coordinates: ${selectedCoordinates.latitude}, ${selectedCoordinates.longitude}`,
      });
    } else {
      toast({
        title: "No Location Selected",
        description: "Please click on the map to select a location.",
        variant: "destructive"
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setSelectedCoordinates(coordinates);
          addMarker(coordinates);

          // Fly to current location
          if (map.current) {
            map.current.flyTo({
              center: [coordinates.longitude, coordinates.latitude],
              zoom: 15,
              duration: 1500
            });
          }

          toast({
            title: "Current Location Found",
            description: "Using your current location.",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please select manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
    }
  };

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Select Location on Map</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mock Map Area */}
          <div className="relative w-full h-96 border rounded-lg overflow-hidden">
            <div
              ref={mapContainer}
              className="w-full h-full"
            />

            {/* Loading overlay */}
            {!isMapLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}

            {/* Instructions overlay */}
            {isMapLoaded && (
              <div className="absolute top-2 left-2 bg-white/90 px-3 py-2 rounded-lg shadow text-sm">
                Click on the map to select a location
              </div>
            )}
          </div>

          {/* Coordinates display */}
          {selectedCoordinates && (
            <div className="bg-accent/10 rounded-lg p-3">
              <p className="text-sm font-medium">Selected Coordinates:</p>
              <p className="text-sm text-muted-foreground">
                Latitude: {selectedCoordinates.latitude}
              </p>
              <p className="text-sm text-muted-foreground">
                Longitude: {selectedCoordinates.longitude}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleUseCurrentLocation}
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>
            <Button 
              onClick={handleConfirmLocation}
              disabled={!selectedCoordinates}
              className="flex-1"
            >
              Confirm Location
            </Button>
          </div>

          {/* <p className="text-xs text-muted-foreground text-center">
            Note: This is a simplified map picker. In production, this would integrate with Google Maps or similar service for accurate location selection.
          </p> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPicker;
