import React from 'react';
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import { MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="grid grid-cols-3 items-center px-4 py-3">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <h1 className="text-xl font-bold text-primary">
            Breezy<span className="text-accent">Driver</span>
          </h1>
        </div>

        {/* Location Badge - Centered */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Toronto, ON
          </Badge>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
