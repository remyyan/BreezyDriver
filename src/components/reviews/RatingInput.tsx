import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const RatingInput = ({ 
  value, 
  onChange, 
  maxRating = 5, 
  size = 'md',
  disabled = false,
  className 
}: RatingInputProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || value;
    
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= displayRating;
      
      stars.push(
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded",
            !disabled && "hover:scale-110 cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <Star 
            className={cn(
              sizeClasses[size],
              isFilled ? "text-yellow-400 fill-current" : "text-gray-300",
              !disabled && "hover:text-yellow-300"
            )}
          />
        </button>
      );
    }
    
    return stars;
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Rate this location";
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>
      <p className="text-sm text-muted-foreground">
        {getRatingText(hoverRating || value)}
      </p>
    </div>
  );
};

export default RatingInput;
