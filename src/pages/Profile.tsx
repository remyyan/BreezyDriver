import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";
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
  const { currentUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAction = (action: string) => {
    toast({
      title: action,
      description: `${action} feature coming soon!`,
    });
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If user is not authenticated, show sign-in prompt
  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Welcome to BreezyDriver</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to access your profile, track your progress, and contribute to the community.
              </p>
              <Button onClick={() => setShowAuthModal(true)} className="w-full">
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                  <AvatarImage src={currentUser.photoURL || ""} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(currentUser.displayName)}
                  </AvatarFallback>
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

              <h1 className="text-2xl font-bold mb-2">
                {currentUser.displayName || 'Driver'}
              </h1>
              <p className="text-muted-foreground mb-4">
                {currentUser.email}
              </p>

              <div className="flex gap-2 mb-4">
                <Badge variant="outline">Member</Badge>
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
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Spots Added</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">New</p>
              <p className="text-sm text-muted-foreground">Contributor</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">
                {new Date(currentUser.metadata.creationTime || '').toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-muted-foreground">Member Since</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No recent activity yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start by adding practice spots or writing reviews!
              </p>
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
                <Badge variant="outline">0</Badge>
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
                <Badge variant="outline">0</Badge>
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
              onClick={handleSignOut}
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