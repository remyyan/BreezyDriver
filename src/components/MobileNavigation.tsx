import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { 
  Home, 
  MapPin, 
  Plus, 
  User, 
  Search,
  Menu,
  X
} from "lucide-react";

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleNavigation = (label: string) => {
    // Check authentication for protected routes (only Add Spot, Profile has built-in auth)
    if (label === "Add Spot" && !currentUser) {
      toast({
        title: "Sign In Required",
        description: `Please sign in to access ${label}.`,
        variant: "destructive"
      });
      setShowAuthModal(true);
      return;
    }

    switch (label) {
      case "Home":
        navigate("/");
        break;
      case "Explore":
        navigate("/explore");
        break;
      case "Add Spot":
        navigate("/add-location");
        break;
      case "Map":
        navigate("/map");
        break;
      case "Profile":
        navigate("/profile");
        break;
      default:
        toast({
          title: `${label} Feature`,
          description: `${label} coming soon!`,
        });
    }
  };

  const handleMenuAction = (action: string) => {
    setIsMenuOpen(false);

    if (action === "Sign In") {
      setShowAuthModal(true);
      return;
    }

    toast({
      title: action,
      description: `${action} feature coming soon!`,
    });
  };

  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Search, label: "Explore" },
    { icon: Plus, label: "Add Spot", accent: true },
    { icon: MapPin, label: "Map" },
    { icon: User, label: "Profile" }
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      {/* <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          // Logo
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">
              Breezy<span className="text-accent">Driver</span>
            </h1>
          </div>

          {/* Location Badge */}
          {/* <div className="flex-1 flex justify-center">
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Toronto, ON
            </Badge>
          </div> */}

          {/* Menu Button */}
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Dropdown Menu */}
        {/* {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {!currentUser ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMenuAction("Sign In")}
                >
                  <User className="w-4 h-4 mr-3" />
                  Sign In
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground px-3 py-2">
                  Welcome, {currentUser.displayName || 'Driver'}!
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleMenuAction("Change Location")}
              >
                <MapPin className="w-4 h-4 mr-3" />
                Change Location
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleMenuAction("Settings")}
              >
                Settings
              </Button>
            </div>
          </div>
        )}
      </nav> */}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={index}
                variant={item.active ? "default" : "ghost"}
                size="sm"
                className={`
                  flex-1 flex flex-col items-center gap-1 h-auto py-2 px-1 max-w-20
                  ${item.accent ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                  ${item.active && !item.accent ? 'bg-primary text-primary-foreground' : ''}
                `}
                onClick={() => handleNavigation(item.label)}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 w-full" /> {/* Top spacer */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default MobileNavigation;