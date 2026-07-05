import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, MessageSquare, Filter, Users, Smartphone } from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Nearby spots",
      description: "Find local practice locations with the simple filters you need.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Verified feedback",
      description: "Ratings from learners who have actually practiced there.",
      color: "text-warning"
    },
    {
      icon: MessageSquare,
      title: "Clear notes",
      description: "Practical details on traffic, parking, and what to expect.",
      color: "text-success"
    },
    {
      icon: Filter,
      title: "Skill filters",
      description: "Search by the exact driving skills you want to practice.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Learner driven",
      description: "Contributions from other new drivers in your area.",
      color: "text-secondary"
    },
    {
      icon: Smartphone,
      title: "Mobile ready",
      description: "Easy access while you’re planning or practicing on the go.",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Practice spot insights
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A more direct look at the tools and details that make practice sessions feel smarter.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <IconComponent className={`w-8 h-8 ${feature.color}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Showcase */}
        <div className="mt-20 text-center">
          <div className="rounded-2xl border border-border/70 bg-card p-8 text-foreground">
            <p className="text-base leading-7 text-muted-foreground">
              A simple, grounded view of the practice tools and local spot details that matter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;