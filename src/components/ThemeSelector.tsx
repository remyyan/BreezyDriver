import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette, Check } from "lucide-react";

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Choose Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                theme === themeOption.id
                  ? 'border-primary shadow-md'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setTheme(themeOption.id)}
            >
              {/* Theme Preview */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{themeOption.name}</h3>
                  {theme === themeOption.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {themeOption.description}
                </p>
                
                {/* Color Preview */}
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.preview.primary }}
                    title="Primary Color"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.preview.secondary }}
                    title="Secondary Color"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.preview.background }}
                    title="Background Color"
                  />
                </div>
                
                {/* Special badges for unique themes */}
                {themeOption.id === 'neon' && (
                  <Badge variant="secondary" className="text-xs">
                    ✨ Neon Effects
                  </Badge>
                )}
                {themeOption.id === 'light' && (
                  <Badge variant="outline" className="text-xs">
                    🌞 Default
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 Themes change the entire app appearance including buttons, cards, and navigation.
            Your selection is saved automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
