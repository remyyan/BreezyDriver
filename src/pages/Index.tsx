import MobileNavigation from "@/components/MobileNavigation";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import LocationsShowcase from "@/components/LocationsShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      <main className="pb-20">
        <HeroSection />
        <LocationsShowcase />
        <FeatureSection />
      </main>
    </div>
  );
};

export default Index;
