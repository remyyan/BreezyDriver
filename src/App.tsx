import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "./components/Header";
import Index from "./pages/Index";
import Map from "./pages/Map";
import Explore from "./pages/Explore";
import AddLocation from "./pages/AddLocation";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import LocationDetails from "./pages/LocationDetails";
import NotFound from "./pages/NotFound";
import MobileNavigation from "./components/MobileNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <div className="min-h-screen bg-background relative transition-colors duration-300">
            {/* Header - always visible and properly positioned */}
            <Header />

            {/* Main content with proper spacing for header and footer */}
            <div className="pt-16 pb-20">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/map" element={<Map />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/add-location" element={<AddLocation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/location/:id" element={<LocationDetails />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            {/* Mobile Navigation - always visible and properly positioned */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <MobileNavigation />
            </div>
          </div>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;