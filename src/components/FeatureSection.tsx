import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, MessageSquare, Filter, Users, Smartphone } from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Smart Location Discovery",
      description: "Find practice spots near you with GPS-powered search. Filter by distance, skill level, and available features.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Community Ratings",
      description: "Real ratings from fellow learners. See difficulty levels, safety scores, and what makes each spot special.",
      color: "text-warning"
    },
    {
      icon: MessageSquare,
      title: "Detailed Reviews",
      description: "Read honest feedback about traffic levels, parking availability, nearby hazards, and practice opportunities.",
      color: "text-success"
    },
    {
      icon: Filter,
      title: "Skill-Based Filtering",
      description: "Looking for parallel parking? Roundabouts? Merging practice? Filter spots by the skills you want to develop.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by drivers, for drivers. Contribute your own discoveries and help fellow learners find their confidence.",
      color: "text-secondary"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Designed for on-the-go use. Access everything you need right from your phone while you're out practicing.",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to Practice with Confidence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            BreezyDriver connects new drivers with the perfect practice locations, 
            backed by real community feedback and smart filtering tools.
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
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
          <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Practicing?
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Join thousands of new drivers who've found their perfect practice spots through BreezyDriver. 
              Safe, supportive, and always improving.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">🎯 Beginner Friendly</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">🛡️ Safety Verified</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">📍 Ontario Wide</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">💬 Community Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;