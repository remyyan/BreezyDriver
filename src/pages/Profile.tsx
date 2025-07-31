import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  MapPin, 
  Star, 
  Trophy, 
  Calendar,
  Settings,
  LogOut,
  Camera
} from "lucide-react";

const Profile = () => {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: action,
      description: `${action} feature coming soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => handleAction("Edit Profile Photo")}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">John Doe</h1>
              <p className="text-muted-foreground mb-4">G1 Driver • Toronto, ON</p>
              
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">New Driver</Badge>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              
              <Button 
                onClick={() => handleAction("Edit Profile")}
                className="w-full max-w-xs"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Spots Added</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">47</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">Gold</p>
              <p className="text-sm text-muted-foreground">Contributor</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">3mo</p>
              <p className="text-sm text-muted-foreground">Member</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Added review for Centennial College Parking</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Added new practice spot: Woodbine Beach</p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Earned Gold Contributor badge</p>
                  <p className="text-xs text-muted-foreground">2 weeks ago</p>
                </div>
                <Trophy className="w-4 h-4 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Contributions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => handleAction("My Added Spots")}
              >
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  My Added Spots
                </span>
                <Badge variant="outline">12</Badge>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => handleAction("My Reviews")}
              >
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  My Reviews
                </span>
                <Badge variant="outline">47</Badge>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => handleAction("Bookmarked Spots")}
              >
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Bookmarked Spots
                </span>
                <Badge variant="outline">8</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleAction("Privacy Settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleAction("Help & Support")}
            >
              <User className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={() => handleAction("Sign Out")}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;