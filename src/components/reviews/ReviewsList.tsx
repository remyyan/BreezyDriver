import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import RatingDisplay from "./RatingDisplay";
import { LocationReview } from "@/lib/firebase";
import { getLocationReviews } from "@/lib/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Plus, Loader2 } from "lucide-react";

interface ReviewsListProps {
  locationId: string;
  locationName: string;
  currentRating?: number;
  reviewCount?: number;
}

const ReviewsList = ({ locationId, locationName, currentRating = 0, reviewCount = 0 }: ReviewsListProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<LocationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [locationId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const locationReviews = await getLocationReviews(locationId);
      setReviews(locationReviews);
      
      // Check if current user has already reviewed
      if (currentUser) {
        const userReview = locationReviews.find(review => review.userId === currentUser.uid);
        setUserHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    setShowReviewForm(false);
    loadReviews(); // Reload reviews to show the new one
  };

  const calculateRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = calculateRatingDistribution();
  const totalReviews = reviews.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="space-y-4">
              {/* Overall Rating */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{currentRating.toFixed(1)}</div>
                  <RatingDisplay rating={currentRating} showNumber={false} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Rating Distribution */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: totalReviews > 0 
                              ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">
                        {ratingDistribution[rating as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your experience at this location!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Review Button / Form */}
      {currentUser && !userHasReviewed && !showReviewForm && (
        <Button 
          onClick={() => setShowReviewForm(true)}
          className="w-full"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      )}

      {userHasReviewed && (
        <Card>
          <CardContent className="p-4 text-center">
            <Badge variant="secondary" className="mb-2">
              <Star className="w-3 h-3 mr-1" />
              You've reviewed this location
            </Badge>
            <p className="text-sm text-muted-foreground">
              Thank you for sharing your experience!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          locationId={locationId}
          locationName={locationName}
          onReviewAdded={handleReviewAdded}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Recent Reviews ({reviews.length})
          </h3>
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
