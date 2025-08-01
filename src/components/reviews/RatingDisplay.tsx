import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

const RatingDisplay = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  showNumber = true,
  className 
}: RatingDisplayProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const isPartial = i > rating && i - 1 < rating;
      
      stars.push(
        <div key={i} className="relative">
          <Star 
            className={cn(
              sizeClasses[size],
              "text-gray-300"
            )}
          />
          {(isFilled || isPartial) && (
            <Star 
              className={cn(
                sizeClasses[size],
                "absolute top-0 left-0 text-yellow-400 fill-current",
                isPartial && "overflow-hidden"
              )}
              style={isPartial ? { 
                clipPath: `inset(0 ${100 - ((rating - Math.floor(rating)) * 100)}% 0 0)` 
              } : undefined}
            />
          )}
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showNumber && (
        <span className={cn("font-medium text-foreground", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
