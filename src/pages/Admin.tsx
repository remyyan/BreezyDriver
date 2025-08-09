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
import { listPendingEditRequests, resolveEditRequest, rejectEditRequest, EditRequestDoc } from "@/lib/editRequestService";
import { geocodeAddress } from "@/lib/geocodingService";
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
  Calendar,
  Wrench
} from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [pendingLocations, setPendingLocations] = useState<PracticeLocation[]>([]);
  const [approvedLocations, setApprovedLocations] = useState<PracticeLocation[]>([]);
  const [allReviews, setAllReviews] = useState<LocationReview[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequestDoc[]>([]);
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
        loadAllReviews(),
        loadEditRequests()
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

  const loadEditRequests = async () => {
    try {
      console.log('Loading edit requests...');
      const items = await listPendingEditRequests();
      console.log('Edit requests loaded:', items);
      setEditRequests(items);
    } catch (error) {
      console.error('Error loading edit requests:', error);
      // Set empty array on error to prevent blocking other data loading
      setEditRequests([]);
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

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;

    try {
      setProcessingId(editingLocation.id);

      const updates = {
        name: editLocationData.name,
        address: editLocationData.address,
        description: editLocationData.description,
        difficulty: editLocationData.difficulty,
        features: editLocationData.features,
        updatedAt: new Date()
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

  const handleApplyEditRequest = async (req: EditRequestDoc) => {
    try {
      setProcessingId(req.id!);
      const updates: any = {};
      if (req.proposedAddress) updates.address = req.proposedAddress;
      if (req.proposedCoordinates) updates.coordinates = req.proposedCoordinates;

      // If address provided but no coords, geocode now
      if (req.proposedAddress && !req.proposedCoordinates) {
        const geo = await geocodeAddress(req.proposedAddress);
        if (geo) updates.coordinates = geo;
      }

      if (Object.keys(updates).length === 0) {
        toast({ title: "Nothing to apply", description: "This request has no actionable changes.", variant: "destructive" });
        return;
      }

      await updateLocation(req.locationId, updates);
      await resolveEditRequest(req.id!);

      toast({ title: "Edit Applied", description: `Updated ${req.locationName || 'location'}` });

      // Refresh lists
      await Promise.all([loadEditRequests(), loadApprovedLocations()]);
    } catch (error) {
      console.error('Error applying edit:', error);
      toast({ title: "Error", description: "Failed to apply edit.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEditRequest = async (reqId: string) => {
    try {
      setProcessingId(reqId);
      await rejectEditRequest(reqId);
      toast({ title: "Request Rejected" });
      await loadEditRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({ title: "Error", description: "Failed to reject request.", variant: "destructive" });
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Locations</TabsTrigger>
            <TabsTrigger value="locations">Manage Locations</TabsTrigger>
            <TabsTrigger value="reviews">Manage Reviews</TabsTrigger>
            <TabsTrigger value="edits">Edit Requests</TabsTrigger>
          </TabsList>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">{editRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Edit Requests</p>
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

          <TabsContent value="edits" className="space-y-6">
            <h2 className="text-2xl font-semibold">Edit Requests</h2>

            {editRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No pending edit requests</h3>
                  <p className="text-muted-foreground">
                    Users can suggest corrections from the location details page.
                  </p>
                </CardContent>
              </Card>
            ) : (
              editRequests.map((req) => (
                <Card key={req.id} className="border-amber-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{req.locationName || 'Location'}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Request from {req.userName || req.userEmail || 'User'}</p>
                      </div>
                      <Badge variant="outline" className="border-amber-500 text-amber-700">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {req.currentAddress && (
                      <div className="text-sm">
                        <span className="font-medium">Current address:</span> {req.currentAddress}
                      </div>
                    )}
                    {req.proposedAddress && (
                      <div className="text-sm">
                        <span className="font-medium">Proposed address:</span> {req.proposedAddress}
                      </div>
                    )}
                    {req.proposedCoordinates && (
                      <div className="text-sm">
                        <span className="font-medium">Proposed pin:</span> {req.proposedCoordinates.latitude.toFixed(6)}, {req.proposedCoordinates.longitude.toFixed(6)}
                      </div>
                    )}
                    {req.message && (
                      <div className="text-sm text-muted-foreground">
                        "{req.message}"
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleApplyEditRequest(req)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Apply Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectEditRequest(req.id!)}
                        disabled={processingId === req.id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Approved Locations</h2>
            <p className="text-muted-foreground">Placeholder for locations management</p>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Reviews</h2>
            <p className="text-muted-foreground">Placeholder for reviews management</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;