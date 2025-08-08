import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReviewsList from "@/components/reviews/ReviewsList";
import RatingDisplay from "@/components/reviews/RatingDisplay";
import { PracticeLocation } from "@/lib/firebase";
import { getLocationById, trackLocationView } from "@/lib/locationService";
import { addBookmark, removeBookmark, isLocationBookmarked } from "@/lib/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Bookmark,
  BookmarkCheck,
  Share2,
  Car,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitEditRequest } from "@/lib/editRequestService";
import { geocodeAddress } from "@/lib/geocodingService";
import { Edit3 } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import { LocationCoordinates } from "@/lib/firebase";



const LocationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [location, setLocation] = useState<PracticeLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);


  // Suggest Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [proposedAddress, setProposedAddress] = useState("");
  const [proposedCoords, setProposedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (id) {
      loadLocation(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentUser && location?.id) {
      checkBookmarkStatus();
    }
  }, [currentUser, location?.id]);

  const loadLocation = async (locationId: string) => {
    try {
      setLoading(true);
      const locationData = await getLocationById(locationId);

      if (!locationData) {
        toast({
          title: "Location Not Found",
          description: "The requested location could not be found.",
          variant: "destructive"
        });
        navigate('/explore');
        return;
      }

      setLocation(locationData);

      // Track view
      if (currentUser) {
        await trackLocationView(locationId, currentUser.uid);
      }
    } catch (error) {
      console.error('Error loading location:', error);
      toast({
        title: "Error",
        description: "Failed to load location details.",
        variant: "destructive"
      });
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!currentUser || !location?.id) return;

    try {
      const bookmarked = await isLocationBookmarked(currentUser.uid, location.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser || !location?.id) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to bookmark locations.",
        variant: "destructive"
      });
      return;
    }

    try {
      setBookmarkLoading(true);

      if (isBookmarked) {
        await removeBookmark(currentUser.uid, location.id);
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "Location removed from your bookmarks.",
        });
      } else {
        await addBookmark(currentUser.uid, location.id);
        setIsBookmarked(true);
        toast({
          title: "Location Bookmarked",
          description: "Location added to your bookmarks.",
        });
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark.",
        variant: "destructive"
      });
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && location) {
      try {
        await navigator.share({
          title: location.name,
          text: `Check out this driving practice location: ${location.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Location link copied to clipboard.",
    });
  };

  const handleGetDirections = () => {
    if (!location?.coordinates) {
      toast({
        title: "No Coordinates",
        description: "Location coordinates are not available.",
        variant: "destructive"
      });
      return;
    }

    const { latitude, longitude } = location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const tryGeocode = async () => {
    if (!proposedAddress.trim()) return;
    try {
      setGeocoding(true);
      const geo = await geocodeAddress(proposedAddress);
      if (geo) setProposedCoords(geo);
      else {
        toast({ title: "Address Not Found", description: "Please try a more specific address.", variant: "destructive" });
        setProposedCoords(null);
      }
    } finally {
      setGeocoding(false);
    }
  };

  const submitEdit = async () => {
    if (!location?.id) return;
    if (!currentUser) {
      toast({ title: "Sign In Required", description: "Please sign in to suggest an edit.", variant: "destructive" });
      return;
    }
    if (!proposedAddress.trim() && !proposedCoords && !editMessage.trim()) {
      toast({ title: "Nothing to submit", description: "Please provide a new address, a pin update, or a short message.", variant: "destructive" });
      return;
    }
    try {
      setSubmittingEdit(true);
      await submitEditRequest(
        location.id,
        { proposedAddress: proposedAddress.trim() || undefined, proposedCoordinates: proposedCoords || undefined, message: editMessage.trim() || "" },
        { id: currentUser.uid, name: currentUser.displayName || undefined, email: currentUser.email || undefined },
        { locationName: location.name, currentAddress: location.address }
      );
      toast({ title: "Edit Request Sent", description: "Thanks! Our team will review it soon." });
      setEditOpen(false);
      setProposedAddress("");
      setProposedCoords(null);
      setEditMessage("");
      setShowMapPicker(false);
    } catch (error) {
      console.error('Error submitting edit request:', error);
      toast({ title: "Error", description: "Failed to submit edit request.", variant: "destructive" });
    } finally {
      setSubmittingEdit(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Location Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested location could not be found.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{location.name}</h1>
            <p className="text-muted-foreground">{location.address}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Image */}
            <Card>
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
                {location.images && location.images.length > 0 ? (
                  <img
                    src={location.images[0]}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-24 h-24 text-primary/40" />
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            {location.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {location.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <ReviewsList
              locationId={location.id!}
              locationName={location.name}
              currentRating={location.rating || 0}
              reviewCount={location.reviewCount || 0}
            />
          </div>

          {/* Right Column - Quick Info & Actions */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rating</span>
                  <div className="flex items-center gap-2">
                    <RatingDisplay
                      rating={location.rating || 0}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      ({location.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Difficulty */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Difficulty</span>
                  <Badge className={getDifficultyColor(location.difficulty)}>
                    {location.difficulty}
                  </Badge>
                </div>

                <Separator />

                {/* Features */}

					<Separator />

					{/* Corrections */}
					<div className="space-y-2">
					  <span className="text-sm font-medium mb-2 block">Think the pin or address is wrong?</span>
					  <Dialog open={editOpen} onOpenChange={setEditOpen}>
					    <DialogTrigger asChild>
					      <Button variant="outline" className="w-full">
					        <Edit3 className="w-4 h-4 mr-2" />
					        Suggest an Edit
					      </Button>
					    </DialogTrigger>
					    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					      <DialogHeader>
					        <DialogTitle>Suggest an Edit</DialogTitle>
					      </DialogHeader>
					      <div className="space-y-4">
					        <div>
					          <label className="text-sm font-medium">Proposed Address</label>
					          <div className="flex gap-2 mt-2">
					            <Input
					              placeholder="Enter the correct address"
					              value={proposedAddress}
					              onChange={(e) => setProposedAddress(e.target.value)}
					            />
					            <Button type="button" onClick={tryGeocode} disabled={geocoding}>
					              {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pin from Address'}
					            </Button>
					          </div>
					          {!!proposedCoords && (
					            <p className="text-xs text-muted-foreground mt-2">
					              Suggested pin: {proposedCoords.latitude.toFixed(6)}, {proposedCoords.longitude.toFixed(6)}
					            </p>
					          )}
					        </div>

					        <div>
					          <div className="flex items-center justify-between mb-2">
					            <label className="text-sm font-medium">Pin Location</label>
					            <Button
					              type="button"
					              variant="outline"
					              size="sm"
					              onClick={() => setShowMapPicker(!showMapPicker)}
					            >
					              {showMapPicker ? 'Hide Map' : 'Show Map'}
					            </Button>
					          </div>
					          {showMapPicker && (
					            <div className="border rounded-lg overflow-hidden h-[300px]">
					              <MapPicker
					                isOpen={showMapPicker}
					                onClose={() => setShowMapPicker(false)}
					                initialCoordinates={proposedCoords || location?.coordinates || { latitude: 43.6532, longitude: -79.3832 }}
					                onLocationSelect={(coords: LocationCoordinates) => setProposedCoords(coords)}
					              />
					            </div>
					          )}
					        </div>

					        <div>
					          <label className="text-sm font-medium">Message (optional)</label>
					          <Textarea
					            placeholder="Describe what should be corrected (e.g., pin is across the street, use the eastbound on-ramp entrance)."
					            value={editMessage}
					            onChange={(e) => setEditMessage(e.target.value)}
					            rows={4}
					          />
					        </div>
					        <div className="flex gap-2">
					          <Button className="flex-1" onClick={submitEdit} disabled={submittingEdit}>
					            {submittingEdit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
					            Submit Request
					          </Button>
					          <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
					            Cancel
					          </Button>
					        </div>
					      </div>
					    </DialogContent>
					  </Dialog>
					</div>

                <div>
                  <span className="text-sm font-medium mb-2 block">Features</span>
                  <div className="flex flex-wrap gap-1">
                    {location.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGetDirections}
                className="w-full"
                size="lg"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/map?location=${location.id}`)}
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className="flex-1"
                >
                  {bookmarkLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
