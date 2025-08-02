import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LocationFormData, DifficultyLevel, LocationCoordinates } from "@/lib/firebase";
import { addLocation } from "@/lib/locationService";
import MapPicker from "@/components/MapPicker";
import {
  MapPin,
  Star,
  Camera,
  Plus,
  Minus,
  Check,
  Loader2
} from "lucide-react";

const AddLocation = () => {
  const { toast } = useToast();
  const { currentUser, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    description: '',
    difficulty: '',
    features: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // If user is not logged in, show sign-in prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <MapPin className="w-6 h-6" />
                Sign In Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need to be signed in to submit a new practice location.
              </p>
              <Button onClick={signInWithGoogle} className="w-full">
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const features = [
    'Large parking spaces',
    'Parallel parking practice',
    'Roundabout nearby',
    'Merging practice',
    'Traffic lights',
    'Stop signs',
    'Security cameras',
    'Well lit area',
    'Weekend access',
    'Free parking',
    'Cones available',
    'Low traffic',
    'Clear markings',
    'Multiple lanes',
    'Hills for practice',
    'Backing up space'
  ];

  const difficulties = [
    { level: 'Beginner' as DifficultyLevel, color: 'bg-green-500', description: 'Perfect for new drivers' },
    { level: 'Intermediate' as DifficultyLevel, color: 'bg-yellow-500', description: 'Some experience needed' },
    { level: 'Advanced' as DifficultyLevel, color: 'bg-red-500', description: 'Challenging for experienced learners' }
  ];

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleLocationSelect = (coordinates: LocationCoordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates
    }));
  };

  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    setFormData(prev => ({ ...prev, difficulty }));
    if (formErrors.difficulty) {
      setFormErrors(prev => ({ ...prev, difficulty: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Location name is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!formData.difficulty) {
      errors.difficulty = 'Difficulty level is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const locationId = await addLocation(formData, currentUser?.uid);

      toast({
        title: "Location Submitted!",
        description: "Thank you for contributing to the community. Your spot will be reviewed and added soon.",
      });

      // Reset form
      setFormData({
        name: '',
        address: '',
        description: '',
        difficulty: '',
        features: []
      });
      setFormErrors({});

    } catch (error) {
      console.error('Error submitting location:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Add Practice Location</h1>
          <p className="text-muted-foreground">
            Help fellow G1 drivers by sharing a great practice spot you've discovered.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Centennial College Parking Lot"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g., 941 Progress Ave, Scarborough, ON"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
                {formErrors.address && (
                  <p className="text-sm text-destructive mt-1">{formErrors.address}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what makes this a good practice spot..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Level */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Level *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {difficulties.map((diff) => (
                  <div
                    key={diff.level}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.difficulty === diff.level
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleDifficultySelect(diff.level)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${diff.color}`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{diff.level}</p>
                        <p className="text-sm text-muted-foreground">{diff.description}</p>
                      </div>
                      {formData.difficulty === diff.level && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {formErrors.difficulty && (
                <p className="text-sm text-destructive mt-2">{formErrors.difficulty}</p>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features Available</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select all features that apply to this location
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature) => (
                  <Badge
                    key={feature}
                    variant={formData.features.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2 text-center"
                    onClick={() => toggleFeature(feature)}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>

              {formData.features.length > 0 && (
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected features:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Photos (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Add photos of the practice area</p>
                <Button variant="outline" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Location on Map */}
          <Card>
            <CardHeader>
              <CardTitle>Pinpoint Location</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set exact coordinates for better accuracy (optional)
              </p>
            </CardHeader>
            <CardContent>
              {formData.coordinates ? (
                <div className="space-y-3">
                  <div className="bg-accent/10 border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">Location Set</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Latitude: {formData.coordinates.latitude}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Longitude: {formData.coordinates.longitude}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="flex-1"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Change Location
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coordinates: undefined }))}
                      className="flex-1"
                    >
                      Remove Location
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-accent/10 border border-border rounded-lg p-6 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Set exact coordinates for better accuracy
                  </p>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Set on Map
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Location'
              )}
            </Button>
          </div>
        </form>

        {/* Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Only submit locations where practice driving is safe and legal</p>
            <p>• Ensure the location is accessible to the public</p>
            <p>• Be accurate with difficulty ratings to help other learners</p>
            <p>• All submissions are reviewed before being published</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialCoordinates={formData.coordinates}
      />
    </div>
  );
};

export default AddLocation;