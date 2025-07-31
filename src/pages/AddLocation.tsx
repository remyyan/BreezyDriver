import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Star, 
  Camera, 
  Plus,
  Minus,
  Check
} from "lucide-react";

const AddLocation = () => {
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

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
    { level: 'Beginner', color: 'bg-green-500', description: 'Perfect for new drivers' },
    { level: 'Intermediate', color: 'bg-yellow-500', description: 'Some experience needed' },
    { level: 'Advanced', color: 'bg-red-500', description: 'Challenging for experienced learners' }
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Location Submitted!",
      description: "Thank you for contributing to the community. Your spot will be reviewed and added soon.",
    });
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
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input 
                  id="address" 
                  placeholder="e.g., 941 Progress Ave, Scarborough, ON"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what makes this a good practice spot..."
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
                      selectedDifficulty === diff.level 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedDifficulty(diff.level)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${diff.color}`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{diff.level}</p>
                        <p className="text-sm text-muted-foreground">{diff.description}</p>
                      </div>
                      {selectedDifficulty === diff.level && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                    variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2 text-center"
                    onClick={() => toggleFeature(feature)}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
              
              {selectedFeatures.length > 0 && (
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected features:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeatures.map((feature) => (
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
            </CardHeader>
            <CardContent>
              <div className="bg-accent/10 border border-border rounded-lg p-6 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground mb-2">Tap to set exact location on map</p>
                <Button variant="outline" type="button">
                  <MapPin className="w-4 h-4 mr-2" />
                  Set on Map
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1">
              Save as Draft
            </Button>
            <Button type="submit" className="flex-1">
              Submit Location
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
    </div>
  );
};

export default AddLocation;