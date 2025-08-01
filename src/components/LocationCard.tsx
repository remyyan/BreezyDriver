import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Car, Users, MessageSquare } from "lucide-react";
import { PracticeLocation } from "@/lib/firebase";
import { trackLocationView } from "@/lib/locationService";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface LocationCardProps extends Omit<PracticeLocation, 'submittedAt' | 'updatedAt' | 'submittedBy' | 'isApproved'> {
  distance?: string;
  lastReview?: string;
}

const LocationCard = ({
  id,
  name,
  address,
  rating = 0,
  reviewCount = 0,
  difficulty,
  features,
  distance = "Unknown",
  lastReview = "Recently",
  images
}: LocationCardProps) => {
  const { currentUser } = useAuth();
  const image = images && images.length > 0 ? images[0] : undefined;

  // Track location view when component mounts
  useEffect(() => {
    if (id) {
      trackLocationView(id, currentUser?.uid);
    }
  }, [id, currentUser?.uid]);
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success text-success-foreground';
      case 'Intermediate': return 'bg-warning text-warning-foreground';
      case 'Advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '🟢';
      case 'Intermediate': return '🟡';
      case 'Advanced': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-card/90 backdrop-blur-sm">
      {/* Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-primary/40" />
          </div>
        )}
        
        {/* Distance Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            {distance}
          </Badge>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getDifficultyColor(difficulty)}>
            {getDifficultyIcon(difficulty)} {difficulty}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {address}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({reviewCount} reviews)
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 3).map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-1"
              >
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Last Review */}
        <div className="flex items-center text-xs text-muted-foreground mb-4">
          <Clock className="w-3 h-3 mr-1" />
          Last reviewed {lastReview}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <MapPin className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;