import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LocationReview } from "@/lib/firebase";
import RatingDisplay from "./RatingDisplay";
import { ThumbsUp, Shield, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { markReviewHelpful } from "@/lib/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ReviewCardProps {
  review: LocationReview;
  showLocationName?: boolean;
}

const ReviewCard = ({ review, showLocationName = false }: ReviewCardProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleMarkHelpful = async () => {
    if (!currentUser || hasMarkedHelpful || !review.id) return;

    try {
      await markReviewHelpful(review.id, currentUser.uid);
      setHelpfulCount(prev => prev + 1);
      setHasMarkedHelpful(true);
      toast({
        title: "Thank you!",
        description: "Your feedback helps the community.",
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast({
        title: "Error",
        description: "Failed to mark review as helpful.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* User Avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="text-sm">
              {getInitials(review.userName)}
            </AvatarFallback>
          </Avatar>

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {review.userName}
                  </h4>
                  {review.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Visit
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <RatingDisplay 
                    rating={review.rating} 
                    size="sm" 
                    showNumber={false}
                  />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Text */}
            {review.comment && (
              <p className="text-sm text-foreground mb-3 leading-relaxed">
                {review.comment}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkHelpful}
                disabled={!currentUser || hasMarkedHelpful}
                className="text-xs h-8 px-2"
              >
                <ThumbsUp className={`w-3 h-3 mr-1 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
                Helpful ({helpfulCount})
              </Button>

              {showLocationName && (
                <Badge variant="outline" className="text-xs">
                  Location Review
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
