import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import RatingInput from "./RatingInput";
import { ReviewFormData } from "@/lib/firebase";
import { addReview } from "@/lib/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star } from "lucide-react";

interface ReviewFormProps {
  locationId: string;
  locationName: string;
  onReviewAdded?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({ locationId, locationName, onReviewAdded, onCancel }: ReviewFormProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    comment: '',
    isVerified: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to write a review.",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (formData.comment.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write at least 10 characters in your review.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await addReview(
        locationId,
        currentUser.uid,
        currentUser.displayName || 'Anonymous User',
        currentUser.email || '',
        formData
      );

      toast({
        title: "Review Added!",
        description: "Thank you for sharing your experience.",
      });

      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        isVerified: false
      });

      // Notify parent component
      onReviewAdded?.();

    } catch (error: any) {
      console.error('Error adding review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Share Your Experience</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to write a review and help other drivers.
          </p>
          <Button onClick={() => toast({ title: "Sign In", description: "Please sign in to continue." })}>
            Sign In to Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Write a Review</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience at {locationName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Input */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Overall Rating *
            </Label>
            <RatingInput
              value={formData.rating}
              onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Comment Input */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
              Your Review *
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell other drivers about your experience at this location. What made it good for practice? Any tips or things to watch out for?"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              disabled={isSubmitting}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.comment.length}/500 characters
            </p>
          </div>

          {/* Verified Visit Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={formData.isVerified}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isVerified: checked as boolean }))
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="verified" className="text-sm">
              I have actually visited this location for practice
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
