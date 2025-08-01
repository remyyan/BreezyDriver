import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PracticeLocation } from "@/lib/firebase";
import { 
  getPendingLocations, 
  approveLocation, 
  rejectLocation 
} from "@/lib/locationService";
import {
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Shield
} from "lucide-react";

// Simple admin check - in production, this should be more robust
const ADMIN_EMAILS = [
  'remyan.yc@gmail.com',
  // Add other admin emails
];

const Admin = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [pendingLocations, setPendingLocations] = useState<PracticeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

  useEffect(() => {
    if (isAdmin) {
      loadPendingLocations();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadPendingLocations = async () => {
    try {
      setLoading(true);
      const locations = await getPendingLocations();
      setPendingLocations(locations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
            Review and moderate submitted practice locations
          </p>
        </div>

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
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Approved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Rejected Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </div>
  );
};

export default Admin;
