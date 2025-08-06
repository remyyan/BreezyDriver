import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PracticeLocation, LocationReview } from "@/lib/firebase";
import {
  getPendingLocations,
  approveLocation,
  rejectLocation,
  getAllApprovedLocations,
  updateLocation,
  deleteLocation
} from "@/lib/locationService";
import {
  getAllReviews,
  updateReview,
  deleteReview
} from "@/lib/reviewService";
import { isUserAdmin } from "@/lib/adminService";
import {
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,

  Loader2,
  Shield,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Calendar
} from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [pendingLocations, setPendingLocations] = useState<PracticeLocation[]>([]);
  const [approvedLocations, setApprovedLocations] = useState<PracticeLocation[]>([]);
  const [allReviews, setAllReviews] = useState<LocationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Edit location state
  const [editingLocation, setEditingLocation] = useState<PracticeLocation | null>(null);
  const [editLocationData, setEditLocationData] = useState({
    name: '',
    address: '',
    description: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    features: [] as string[]
  });

  // Edit review state
  const [editingReview, setEditingReview] = useState<LocationReview | null>(null);
  const [editReviewData, setEditReviewData] = useState({
    rating: 5,
    comment: ''
  });

  // Check if user is admin
  const isAdmin = isUserAdmin(currentUser?.email);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPendingLocations(),
        loadApprovedLocations(),
        loadAllReviews()
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingLocations = async () => {
    try {
      const locations = await getPendingLocations();
      setPendingLocations(locations);
    } catch (error) {
      console.error('Error loading pending locations:', error);
    }
  };

  const loadApprovedLocations = async () => {
    try {
      const locations = await getAllApprovedLocations();
      setApprovedLocations(locations);
    } catch (error) {
      console.error('Error loading approved locations:', error);
    }
  };

  const loadAllReviews = async () => {
    try {
      const reviews = await getAllReviews();
      setAllReviews(reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleApprove = async (locationId: string) => {
    try {
      setProcessingId(locationId);
      await approveLocation(locationId, currentUser?.uid);
      
      toast({
        title: "Location Approved",
        description: "The location has been approved and is now visible to users.",
      });
      
      // Remove from pending list
      setPendingLocations(prev => prev.filter(loc => loc.id !== locationId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve location",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (locationId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this location.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessingId(locationId);
      await rejectLocation(locationId, rejectionReason, currentUser?.uid);

      toast({
        title: "Location Rejected",
        description: "The location has been rejected with the provided reason.",
      });

      // Remove from pending list and reset form
      setPendingLocations(prev => prev.filter(loc => loc.id !== locationId));
      setRejectionReason('');
      setShowRejectForm(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject location",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteLocation = async (locationId: string, locationName: string) => {
    if (!confirm(`Are you sure you want to delete "${locationName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingId(locationId);
      await deleteLocation(locationId);

      toast({
        title: "Location Deleted",
        description: "The location has been permanently deleted.",
      });

      // Remove from approved locations list
      setApprovedLocations(prev => prev.filter(loc => loc.id !== locationId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(reviewId);
      await deleteReview(reviewId);

      toast({
        title: "Review Deleted",
        description: "The review has been permanently deleted.",
      });

      // Remove from reviews list and reload approved locations to update ratings
      setAllReviews(prev => prev.filter(review => review.id !== reviewId));
      loadApprovedLocations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditLocation = (location: PracticeLocation) => {
    setEditingLocation(location);
    setEditLocationData({
      name: location.name,
      address: location.address,
      description: location.description || '',
      difficulty: location.difficulty,
      features: [...location.features]
    });
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;

    try {
      setProcessingId(editingLocation.id!);

      const updates = {
        name: editLocationData.name,
        address: editLocationData.address,
        description: editLocationData.description,
        difficulty: editLocationData.difficulty,
        features: editLocationData.features
      };

      await updateLocation(editingLocation.id!, updates);

      toast({
        title: "Location Updated",
        description: "The location has been successfully updated.",
      });

      // Update the location in the list
      setApprovedLocations(prev =>
        prev.map(loc =>
          loc.id === editingLocation.id
            ? { ...loc, ...updates }
            : loc
        )
      );

      // Close the edit dialog
      setEditingLocation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddFeature = (feature: string) => {
    if (feature.trim() && !editLocationData.features.includes(feature.trim())) {
      setEditLocationData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setEditLocationData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleEditReview = (review: LocationReview) => {
    setEditingReview(review);
    setEditReviewData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      setProcessingId(editingReview.id!);

      const updates = {
        rating: editReviewData.rating,
        comment: editReviewData.comment
      };

      await updateReview(editingReview.id!, updates);

      toast({
        title: "Review Updated",
        description: "The review has been successfully updated.",
      });

      // Update the review in the list
      setAllReviews(prev =>
        prev.map(review =>
          review.id === editingReview.id
            ? { ...review, ...updates }
            : review
        )
      );

      // Reload approved locations to update ratings
      loadApprovedLocations();

      // Close the edit dialog
      setEditingReview(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  // If user is not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage locations, reviews, and moderate content
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Locations</TabsTrigger>
            <TabsTrigger value="locations">Manage Locations</TabsTrigger>
            <TabsTrigger value="reviews">Manage Reviews</TabsTrigger>
          </TabsList>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{pendingLocations.length}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{approvedLocations.length}</p>
                    <p className="text-sm text-muted-foreground">Approved Locations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{allReviews.length}</p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="pending" className="space-y-6">

        {/* Pending Locations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Pending Locations</h2>
          
          {pendingLocations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No locations pending review at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingLocations.map((location) => (
              <Card key={location.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {location.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {location.address}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {location.description && (
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{location.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Difficulty</h4>
                      <Badge variant="secondary">{location.difficulty}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {location.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {location.coordinates && (
                    <div>
                      <h4 className="font-medium mb-1">Coordinates</h4>
                      <p className="text-sm text-muted-foreground">
                        {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Submitted by: {location.submittedBy || 'Anonymous'}</span>
                    <Clock className="w-4 h-4 ml-4" />
                    <span>
                      {location.submittedAt instanceof Date 
                        ? location.submittedAt.toLocaleDateString()
                        : 'Unknown date'
                      }
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApprove(location.id!)}
                      disabled={processingId === location.id}
                      className="flex-1"
                    >
                      {processingId === location.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectForm(location.id!)}
                      disabled={processingId === location.id}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  
                  {/* Rejection Form */}
                  {showRejectForm === location.id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium mb-2 text-red-800">Rejection Reason</h4>
                      <Textarea
                        placeholder="Please provide a reason for rejecting this location..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(location.id!)}
                          disabled={processingId === location.id}
                        >
                          {processingId === location.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Confirm Rejection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowRejectForm(null);
                            setRejectionReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Approved Locations</h2>

            {approvedLocations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Approved Locations</h3>
                  <p className="text-muted-foreground">
                    No approved locations found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedLocations.map((location) => (
                <Card key={location.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {location.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {location.address}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Approved
                        </Badge>
                        <Badge variant="secondary">{location.difficulty}</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {location.description && (
                      <div>
                        <h4 className="font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{location.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Rating</h4>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">
                            {location.rating?.toFixed(1) || 'No ratings'}
                            {location.reviewCount ? ` (${location.reviewCount} reviews)` : ''}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-1">Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {location.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {location.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{location.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Submitted by: {location.submittedBy || 'Anonymous'}</span>
                      <Calendar className="w-4 h-4 ml-4" />
                      <span>
                        {location.submittedAt instanceof Date
                          ? location.submittedAt.toLocaleDateString()
                          : 'Unknown date'
                        }
                      </span>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex gap-3 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLocation(location)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Location</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={editLocationData.name}
                                onChange={(e) => setEditLocationData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Location name"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-address">Address</Label>
                              <Input
                                id="edit-address"
                                value={editLocationData.address}
                                onChange={(e) => setEditLocationData(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Location address"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editLocationData.description}
                                onChange={(e) => setEditLocationData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Location description"
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-difficulty">Difficulty</Label>
                              <div className="mt-2">
                                {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                                  <label key={diff} className="flex items-center space-x-2 mb-2">
                                    <input
                                      type="radio"
                                      name="difficulty"
                                      value={diff}
                                      checked={editLocationData.difficulty === diff}
                                      onChange={(e) => setEditLocationData(prev => ({
                                        ...prev,
                                        difficulty: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced'
                                      }))}
                                      className="text-primary"
                                    />
                                    <span className="text-sm">{diff}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>Features</Label>
                              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                {editLocationData.features.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                    <button
                                      onClick={() => handleRemoveFeature(feature)}
                                      className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a feature"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddFeature(e.currentTarget.value);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    if (input) {
                                      handleAddFeature(input.value);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleUpdateLocation}
                                disabled={processingId === editingLocation?.id}
                                className="flex-1"
                              >
                                {processingId === editingLocation?.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Update Location
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingLocation(null)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id!, location.name)}
                        disabled={processingId === location.id}
                      >
                        {processingId === location.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Reviews</h2>

            {allReviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews</h3>
                  <p className="text-muted-foreground">
                    No reviews found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              allReviews.map((review) => (
                <Card key={review.id} className="border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Review by {review.userName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Location ID: {review.locationId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.rating}/5</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Comment</h4>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{review.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {review.createdAt instanceof Date
                            ? review.createdAt.toLocaleDateString()
                            : 'Unknown date'
                          }
                        </span>
                      </div>
                      {review.helpful && review.helpful > 0 && (
                        <div className="flex items-center gap-1">
                          <span>👍 {review.helpful} helpful</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div className="flex gap-3 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Review</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-rating">Rating</Label>
                              <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditReviewData(prev => ({ ...prev, rating: star }))}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-6 h-6 ${
                                        star <= editReviewData.rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      } hover:text-yellow-400 transition-colors`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {editReviewData.rating}/5
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="edit-comment">Comment</Label>
                              <Textarea
                                id="edit-comment"
                                value={editReviewData.comment}
                                onChange={(e) => setEditReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Review comment"
                                rows={4}
                                className="mt-2"
                              />
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleUpdateReview}
                                disabled={processingId === editingReview?.id}
                                className="flex-1"
                              >
                                {processingId === editingReview?.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Update Review
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingReview(null)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id!)}
                        disabled={processingId === review.id}
                      >
                        {processingId === review.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
